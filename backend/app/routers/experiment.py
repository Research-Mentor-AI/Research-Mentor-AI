import asyncio
from urllib.parse import quote_plus
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from .. import auth, config, llm, prompts, scholar
from .explore import as_list

router = APIRouter(prefix="/api/experiment", tags=["experiment"])


class PlanIn(BaseModel):
    gaps: list[dict]


def named(items, key="name") -> list[dict]:
    out = []
    for i in items or []:
        d = i if isinstance(i, dict) else {key: str(i)}
        if str(d.get(key, "")).strip():
            out.append({k: str(v).strip() for k, v in d.items()})
    return out


async def plan_one(g: dict) -> dict:
    p = await llm.chat_json(prompts.SYSTEM, prompts.experiment(g), task="experiment", max_tokens=config.TOKENS["experiment"])
    steps = [{"phase": str(s.get("phase", "")).strip(), "tasks": as_list(s.get("tasks")), "outcome": str(s.get("outcome", "")).strip()} for s in p.get("steps", []) if isinstance(s, dict)]
    datasets = named(p.get("datasets"))
    baselines = named(p.get("baselines"))
    for d in datasets:   # search links, not guessed URLs
        d["url"] = "https://datasetsearch.research.google.com/search?query=" + quote_plus(d["name"])
    for b in baselines:
        b["url"] = "https://scholar.google.com/scholar?q=" + quote_plus(b["name"])
    try:
        reading = await scholar.gather_candidates([str(p.get("search_query") or g.get("search_query") or g["title"])], 5, per_query=10)
    except scholar.ScholarError:
        reading = []
    return {"summary": str(p.get("summary", "")).strip(), "objective": str(p.get("objective", "")).strip(), "methodology": str(p.get("methodology", "")).strip(),
            "steps": steps, "datasets": datasets, "baselines": baselines, "tools": as_list(p.get("tools")), "metrics": named(p.get("metrics")),
            "expected_contribution": str(p.get("expected_contribution", "")).strip(), "risks": as_list(p.get("risks")),
            "resources": [scholar.public(r) for r in reading]}


@router.post("/plan")
async def plan(b: PlanIn, user: dict = Depends(auth.current_user)):
    gaps = [g for g in b.gaps if isinstance(g, dict) and g.get("title")][:8]
    if not gaps:
        raise HTTPException(422, "Select at least one research gap first.")
    res = await asyncio.gather(*[plan_one(g) for g in gaps], return_exceptions=True)
    plans = {}
    for g, r in zip(gaps, res):
        plans[g["title"]] = {"error": str(r) or "Could not build this plan."} if isinstance(r, Exception) else r
    return {"plans": plans}
