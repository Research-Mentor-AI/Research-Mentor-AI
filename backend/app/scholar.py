"""Real papers from OpenAlex (free scholarly index). The LLM never invents papers."""
import asyncio, re, time
import httpx
from . import config

API = "https://api.openalex.org/works"
SELECT = "id,doi,title,publication_year,publication_date,cited_by_count,primary_location,abstract_inverted_index,authorships"


class ScholarError(Exception):
    pass


_CACHE: dict[tuple, tuple[float, list]] = {}   # same search twice = no second charge from OpenAlex
CACHE_TTL = 3600


def explain(e: Exception) -> str:
    """Turn an OpenAlex failure into a message a student or developer can act on."""
    if isinstance(e, httpx.HTTPStatusError):
        code = e.response.status_code
        if code in (402, 403, 409, 429):
            return ("OpenAlex refused the request: the daily free limit is used up, or an API key is needed. "
                    "Add a free OPENALEX_API_KEY to backend/.env (get it at openalex.org/settings/api), "
                    "or try again after midnight UTC.")
        if code == 401:
            return "OpenAlex rejected the OPENALEX_API_KEY. Check that it is copied correctly."
        return f"OpenAlex returned an error ({code}). Please try again."
    return "Could not connect to OpenAlex. Check the server's internet connection."


def _abstract(inv) -> str:
    if not inv:
        return ""
    pos = sorted((i, w) for w, idxs in inv.items() for i in idxs)
    return " ".join(w for _, w in pos)


def _kind(src: dict) -> str:
    return {"conference": "Conference", "journal": "Journal"}.get((src or {}).get("type"), "Other")


def normalize(w: dict) -> dict:
    loc = w.get("primary_location") or {}
    src = loc.get("source") or {}
    names = [a["author"]["display_name"] for a in (w.get("authorships") or []) if a.get("author", {}).get("display_name")]
    authors = ", ".join(names[:3]) + (" et al." if len(names) > 3 else "")
    return {
        "id": w["id"], "title": (w.get("title") or "").strip(), "abstract": _abstract(w.get("abstract_inverted_index")),
        "year": w.get("publication_year"), "date": w.get("publication_date"), "citations": w.get("cited_by_count") or 0,
        "venue": src.get("display_name") or "", "publisher": src.get("host_organization_name") or src.get("display_name") or "Unknown",
        "type": _kind(src), "url": loc.get("landing_page_url") or w.get("doi") or w["id"], "doi": w.get("doi"), "authors": authors,
    }


async def _get(client: httpx.AsyncClient, params: dict) -> httpx.Response:
    for attempt in (0, 1):   # one retry for a network blip or a server error
        try:
            r = await client.get(API, params=params)
        except httpx.TransportError:
            if attempt:
                raise
        else:
            if r.status_code < 500 or attempt:
                return r
        await asyncio.sleep(1)


async def search_works(client: httpx.AsyncClient, query: str, per_page: int = 25, kind: str = "journal") -> list[dict]:
    """Search OpenAlex. kind is "journal" or "conference": preprints and repositories are left out on purpose."""
    ck = (query, kind, per_page)
    hit = _CACHE.get(ck)
    if hit and time.time() - hit[0] < CACHE_TTL:
        return hit[1]
    params = {"search": query, "filter": f"has_abstract:true,primary_location.source.type:{kind}", "per-page": per_page, "select": SELECT}
    if config.OPENALEX_API_KEY:
        params["api_key"] = config.OPENALEX_API_KEY
    r = await _get(client, params)
    if r.status_code == 400:   # filter not accepted: search everything and drop other types below
        params["filter"] = "has_abstract:true"
        r = await _get(client, params)
    r.raise_for_status()
    out = []
    for w in r.json().get("results", []):
        p = normalize(w)
        if p["title"] and len(p["abstract"]) >= 80 and p["type"] in ("Journal", "Conference"):
            out.append(p)
    if len(_CACHE) > 500:
        _CACHE.pop(min(_CACHE, key=lambda k: _CACHE[k][0]))
    _CACHE[ck] = (time.time(), out)
    return out


def _key(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", title.lower()).strip()


async def gather_candidates(queries: list[str], pool: int, per_query: int = 25, exclude_title: str = "") -> list[dict]:
    """Search several queries in parallel, merge round-robin, remove duplicates."""
    queries = [q for q in dict.fromkeys(q.strip() for q in queries if q and q.strip())][:5]
    if not queries:
        return []
    async with httpx.AsyncClient(timeout=30, headers={"User-Agent": "ResearchMentorAI/1.0"}) as c:
        # every query is searched for journal AND conference papers so both always appear
        results = await asyncio.gather(*[search_works(c, q, per_query, kind) for q in queries for kind in ("conference", "journal")], return_exceptions=True)
    ok = [r for r in results if not isinstance(r, Exception)]
    if not ok:
        raise ScholarError(explain(next(r for r in results if isinstance(r, Exception))))
    seen, out = {_key(exclude_title)} if exclude_title else set(), []
    for rank in range(per_query):
        for lst in ok:
            if rank < len(lst):
                p = lst[rank]
                k = _key(p["title"])
                if p["id"] in seen or k in seen:
                    continue
                seen.update({p["id"], k})
                out.append(p)
                if len(out) >= pool:
                    return out
    return out


def public(p: dict, **extra) -> dict:
    """Paper fields the frontend is allowed to see (no abstract)."""
    keys = ("title", "publisher", "venue", "year", "date", "type", "citations", "url", "doi", "authors")
    return {**{k: p.get(k) for k in keys}, **extra}
