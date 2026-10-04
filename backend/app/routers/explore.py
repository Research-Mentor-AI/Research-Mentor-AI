from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from .. import auth, cache, config, llm, prompts, scholar

router = APIRouter(prefix="/api/explore", tags=["explore"])
FIRST, MORE = 10, 5


class Problem(BaseModel):
    problem_statement: str


def as_list(x) -> list[str]:
    if isinstance(x, str):
        x = [x]
    return [str(i).strip() for i in (x or []) if str(i).strip()]


def clamp(n, default=0) -> int:
    try:
        return max(0, min(100, int(round(float(n)))))
    except (TypeError, ValueError):
        return default


async def rank_papers(ps: str, cands: list[dict]) -> list[dict]:
    """LLM scores every candidate 0-100 against the problem; returns them best first."""
    res = await llm.chat_json(prompts.SYSTEM, prompts.rank(ps, cands), task="rank", model=config.FAST_MODEL, max_tokens=4000, temperature=0.1)
    scores = {}
    for s in res.get("scores", []):
        if isinstance(s, dict) and isinstance(s.get("i"), int):
            scores[s["i"]] = (clamp(s.get("score")), str(s.get("reason", "")).strip())
    ranked = [{**p, "similarity": scores.get(i, (0, ""))[0], "reason": scores.get(i, (0, ""))[1]} for i, p in enumerate(cands)]
    return sorted(ranked, key=lambda p: p["similarity"], reverse=True)


def page(pool: list[dict], offset: int, limit: int) -> dict:
    chunk = pool[offset:offset + limit]
    return {"papers": [scholar.public(p, similarity=p["similarity"], reason=p["reason"]) for p in chunk],
            "total": len(pool), "has_more": offset + len(chunk) < len(pool)}


@router.post("/analyze")
async def analyze(b: Problem, user: dict = Depends(auth.current_user)):
    ps = b.problem_statement.strip()
    if len(ps) < 15:
        raise HTTPException(422, "Please describe your problem in at least one full sentence.")
    a = await llm.chat_json(prompts.SYSTEM, prompts.explore(ps), task="explore", max_tokens=3000)
    queries = as_list(a.get("search_queries"))[:4] or [ps[:150]]
    cands = await scholar.gather_candidates(queries, config.EXPLORE_POOL)
    pool = await rank_papers(ps, cands) if cands else []
    return {
        "domain": as_list(a.get("domain")), "understanding": str(a.get("understanding", "")).strip(),
        "objectives": as_list(a.get("objectives")), "questions": as_list(a.get("questions")),
        "datasets": as_list(a.get("datasets")), "methodology": str(a.get("methodology", "")).strip(),
        "challenges": as_list(a.get("challenges")), "contributions": as_list(a.get("contributions")),
        "search_id": cache.put(user["id"], pool), **page(pool, 0, FIRST),
    }


@router.get("/papers")
async def more_papers(search_id: str, offset: int = Query(FIRST, ge=0), limit: int = Query(MORE, ge=1, le=20), user: dict = Depends(auth.current_user)):
    pool = cache.get(user["id"], search_id)
    if pool is None:
        raise HTTPException(404, "This search has expired. Please analyse your problem again.")
    return page(pool, offset, limit)
