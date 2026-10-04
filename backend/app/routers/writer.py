import asyncio
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from .. import auth, config, llm, prompts, scholar
from .explore import as_list

router = APIRouter(prefix="/api/writer", tags=["writer"])
NEEDS_REFS = {"Introduction", "Literature Review", "References"}


class DraftIn(BaseModel):
    fields: dict[str, str]
    sections: list[str]


def ref_line(i: int, p: dict) -> str:
    return f"[{i}] {p['authors'] + ' ' if p['authors'] else ''}({p['year']}). {p['title']}. {p['venue'] or p['publisher']}." + (f" {p['doi']}" if p['doi'] else "")


async def one(name: str, f: dict, refs_text: str) -> str:
    r = await llm.chat_json(prompts.SYSTEM, prompts.section(name, f, refs_text), task="writer", max_tokens=1800, temperature=0.4)
    return str(r.get("text", "")).strip()


@router.post("/draft")
async def draft(b: DraftIn, user: dict = Depends(auth.current_user)):
    f = {k: (v or "").strip() for k, v in b.fields.items()}
    sections = [s.strip() for s in b.sections if s.strip()][:12]
    if not f.get("title") or not f.get("problem") or not sections:
        raise HTTPException(422, "A title, a research summary and at least one section are required.")
    user_refs = [l.strip() for l in f.get("refs", "").splitlines() if l.strip()]
    refs_note = ""
    if user_refs:
        ref_lines = [f"[{i + 1}] {r}" for i, r in enumerate(user_refs)]
    elif NEEDS_REFS & set(sections):   # no references given: suggest real ones from OpenAlex
        plan = await llm.chat_json(prompts.SYSTEM, prompts.queries(f"{f['title']}. {f['problem']}"), task="queries", model=config.FAST_MODEL, max_tokens=500, temperature=0.2)
        try:
            found = await scholar.gather_candidates(as_list(plan.get("search_queries"))[:3], 8, per_query=10)
        except scholar.ScholarError:
            found = []
        ref_lines = [ref_line(i + 1, p) for i, p in enumerate(found)]
        refs_note = "Suggested references found automatically. Check each one and keep only those you actually used.\n\n"
    else:
        ref_lines = []
    refs_text = "\n".join(ref_lines)
    llm_sections = [s for s in sections if s != "References"]
    texts = await asyncio.gather(*[one(s, f, refs_text) for s in llm_sections])
    out = dict(zip(llm_sections, texts))
    if "References" in sections:
        out["References"] = (refs_note + refs_text) if refs_text else "[Paste your references in the form and redraft to list them here.]"
    return {s: out[s] for s in sections}
