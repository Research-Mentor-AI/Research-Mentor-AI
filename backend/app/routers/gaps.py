import asyncio
from fastapi import APIRouter, Depends, File, UploadFile
from .. import auth, config, docs, llm, prompts, scholar
from .explore import as_list

router = APIRouter(prefix="/api/gaps", tags=["gaps"])


def clean_gap(g: dict, n: int, text_norm: str) -> dict:
    impact = str(g.get("impact", "Medium")).strip().title()
    quotes = [q.strip() for q in as_list(g.get("quotes")) if docs.quote_in_text(q, text_norm)]
    return {"id": n, "title": str(g.get("title", f"Gap {n + 1}")).strip(), "explanation": str(g.get("explanation", "")).strip(),
            "done": str(g.get("done", "")).strip(), "limit": str(g.get("limit", "")).strip(), "improve": str(g.get("improve", "")).strip(),
            "impact": impact if impact in ("High", "Medium", "Low") else "Medium", "impact_reason": str(g.get("impact_reason", "")).strip(),
            "quotes": quotes, "search_query": str(g.get("search_query", "")).strip()}


@router.post("/detect")
async def detect(file: UploadFile = File(...), user: dict = Depends(auth.current_user)):
    text = docs.extract_text(file.filename or "", await file.read())
    res = await llm.chat_json(prompts.SYSTEM, prompts.gaps(docs.shorten(text)), task="gaps", max_tokens=6000)
    tn = docs.norm(text)
    paper = {"title": str((res.get("paper") or {}).get("title", file.filename)).strip(), "summary": str((res.get("paper") or {}).get("summary", "")).strip()}
    gaps = [clean_gap(g, i, tn) for i, g in enumerate(res.get("gaps", [])[:6]) if isinstance(g, dict)]
    if not gaps:
        return {"paper": paper, "gaps": []}

    # Evidence from other papers: find candidates per gap, then let the LLM keep only the ones that truly support it.
    found = await asyncio.gather(*[scholar.gather_candidates([g["search_query"] or g["title"]], 8, per_query=12, exclude_title=paper["title"]) for g in gaps], return_exceptions=True)
    cands = [f if not isinstance(f, Exception) else [] for f in found]
    if any(cands):
        sup = await llm.chat_json(prompts.SYSTEM, prompts.support(gaps, cands), task="support", model=config.FAST_MODEL, max_tokens=3500, temperature=0.1)
        by_id = {s.get("id"): s.get("supporting", []) for s in sup.get("gaps", []) if isinstance(s, dict)}
    else:
        by_id = {}
    for g, cl in zip(gaps, cands):
        g["support"] = []
        for s in by_id.get(g["id"], []):
            i = s.get("i") if isinstance(s, dict) else None
            if isinstance(i, int) and 0 <= i < len(cl) and all(x["title"] != cl[i]["title"] for x in g["support"]):
                g["support"].append(scholar.public(cl[i], reason=str(s.get("reason", "")).strip()))
    return {"paper": paper, "gaps": gaps}
