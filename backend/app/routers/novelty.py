from collections import Counter
from fastapi import APIRouter, Depends, HTTPException
from .. import auth, config, llm, prompts, scholar
from .explore import Problem, as_list, clamp

router = APIRouter(prefix="/api/novelty", tags=["novelty"])


def verdict(score: int) -> str:
    return "Low novelty" if score < 40 else "Medium novelty" if score <= 80 else "High novelty"


@router.post("/check")
async def check(b: Problem, user: dict = Depends(auth.current_user)):
    ps = b.problem_statement.strip()
    if len(ps) < 15:
        raise HTTPException(422, "Please describe your idea in at least one full sentence.")
    plan = await llm.chat_json(prompts.SYSTEM, prompts.queries(ps), task="queries", model=config.FAST_MODEL, max_tokens=500, temperature=0.2)
    cands = await scholar.gather_candidates(as_list(plan.get("search_queries"))[:4] or [ps[:150]], 20, per_query=15)
    if not cands:
        raise HTTPException(404, "No related papers were found, so novelty cannot be judged. Try rewording your idea.")
    core = str(plan.get("core_idea", "")).strip()
    r = await llm.chat_json(prompts.SYSTEM, prompts.novelty(ps, core, cands), task="novelty", max_tokens=4500)
    papers = []
    for item in r.get("papers", []):
        i = item.get("i") if isinstance(item, dict) else None
        if isinstance(i, int) and 0 <= i < len(cands) and all(p["_i"] != i for p in papers):
            papers.append({**scholar.public(cands[i]), "overlap": clamp(item.get("overlap")), "how": str(item.get("how", "")).strip(), "_i": i})
    papers.sort(key=lambda p: p["overlap"], reverse=True)
    for p in papers:
        del p["_i"]
    venues = Counter((p["venue"], p["type"]) for p in papers if p["venue"])
    score = clamp(r.get("score"), 50)
    return {
        "score": score, "verdict": verdict(score), "idea": core, "summary": str(r.get("summary", "")).strip(),
        "already_done": as_list(r.get("already_done")), "open_angles": as_list(r.get("open_angles")),
        "stand_out": as_list(r.get("stand_out")), "papers": papers,
        "venues": [{"name": n, "type": t, "count": c} for (n, t), c in venues.most_common(5)],
    }
