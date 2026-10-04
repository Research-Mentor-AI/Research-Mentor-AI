import asyncio
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


BATCH = 10   # papers scored per AI call: small batches are far more reliable than one big list


async def _score_batch(ps: str, batch: list[dict]) -> dict[int, tuple[int, str]]:
    """Score up to BATCH papers. Any paper the model skips is asked about once more."""
    scores: dict[int, tuple[int, str]] = {}
    todo = list(range(len(batch)))
    for _ in range(2):
        sub = [batch[i] for i in todo]
        res = await llm.chat_json(prompts.SYSTEM, prompts.rank(ps, sub), task="rank", model=config.FAST_MODEL, max_tokens=config.TOKENS["rank"], temperature=0.1)
        for s in res.get("scores", []):
            if isinstance(s, dict) and isinstance(s.get("i"), int) and 0 <= s["i"] < len(sub) and s.get("score") is not None:
                scores[todo[s["i"]]] = (clamp(s["score"]), str(s.get("reason", "")).strip())
        todo = [i for i in todo if i not in scores]
        if not todo:
            break
    return scores


async def rank_papers(ps: str, cands: list[dict]) -> list[dict]:
    """LLM scores every candidate 0-100 against the problem; best first.
    A paper the AI never scored is dropped, never shown with a made-up 0%."""
    batches = [cands[i:i + BATCH] for i in range(0, len(cands), BATCH)]
    results = await asyncio.gather(*[_score_batch(ps, b) for b in batches])
    ranked = [{**p, "similarity": sc[i][0], "reason": sc[i][1]} for b, sc in zip(batches, results) for i, p in enumerate(b) if i in sc]
    if not ranked:
        raise llm.LLMError("The AI could not score the papers. Please try again.")
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
    a = await llm.chat_json(prompts.SYSTEM, prompts.explore(ps), task="explore", max_tokens=config.TOKENS["explore"])
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
