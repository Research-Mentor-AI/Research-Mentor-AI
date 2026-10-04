"""All prompts live here so you can tune the AI's behaviour in one place."""

SYSTEM = ("You are a careful research mentor for university students. Reply with ONE valid JSON object and nothing else. "
          "Never invent papers, authors, numbers, quotes or URLs. If you are not sure, leave the field empty or say so plainly. "
          "Write in clear, simple English that a student can follow.")


def explore(ps: str) -> str:
    return f'''A student describes their research problem:
"""{ps}"""

Analyse it and return JSON with exactly these keys:
{{
 "domain": [2-4 research fields this belongs to],
 "understanding": "3-4 sentences restating the problem clearly and why it matters",
 "objectives": [3-5 concrete research objectives],
 "questions": [3-5 research questions],
 "datasets": [3-6 real, well-known datasets (names only) suited to this problem; [] if you do not know any],
 "methodology": "one paragraph: recommended approach, model families and how to evaluate",
 "challenges": [3-5 realistic difficulties],
 "contributions": [3-4 contributions the student could realistically claim],
 "search_queries": [3-4 short keyword queries (3-8 words, no quotes) to find closely related academic papers, each from a different angle: task, method, data/application]
}}
Be specific to THIS problem, not generic.'''


def queries(ps: str) -> str:
    return f'''Student's research idea:
"""{ps}"""
Return JSON: {{"core_idea": "one sentence", "search_queries": [3-4 short keyword queries (3-8 words) to find the closest published papers, each from a different angle]}}'''


def _papers(cands: list[dict], n: int = 450) -> str:
    return "\n".join(f"[{i}] {p['title']} ({p.get('year')}): {p['abstract'][:n]}" for i, p in enumerate(cands))


def rank(ps: str, cands: list[dict]) -> str:
    return f'''Student's problem:
"""{ps}"""

Rate how similar each paper is to the student's problem (topic, task, method, data). Score 0-100. Be discriminating and use the full range: a paper that only shares a keyword scores below 40.

Papers:
{_papers(cands, 400)}

Return JSON: {{"scores": [{{"i": 0, "score": 85, "reason": "max 18 words on why it is close or different"}}]}} covering every paper.'''


def novelty(ps: str, core: str, cands: list[dict]) -> str:
    return f'''Student's idea:
"""{ps}"""
Core idea: {core}

Published papers found for this idea:
{_papers(cands, 500)}

Judge how novel the idea is, honestly, using ONLY the papers above. Do not make claims about papers that are not listed.
Return JSON:
{{
 "score": integer 0-100 (100 = nothing similar exists, 0 = already done),
 "summary": "2-3 plain sentences explaining the score",
 "already_done": [3-5 things the listed papers already cover, each ending with the paper number like "[2]"],
 "open_angles": [3-5 angles the listed papers do NOT cover that the student could own],
 "stand_out": [3-5 concrete suggestions to make the idea more novel],
 "papers": [{{"i": paper number, "overlap": 0-100, "how": "max 25 words: how it overlaps with or differs from the idea"}}] for the 8 most related papers (all of them if fewer than 8)
}}'''


def gaps(text: str) -> str:
    return f'''Below is the text of a research paper (the middle may be shortened).

Find 4-6 genuine research gaps a student could address. Prefer limitations the authors admit, narrow data, weak evaluation, missing comparisons and future-work statements.

Return JSON:
{{
 "paper": {{"title": "the paper's title", "summary": "2-3 sentences: what the paper does and its main result"}},
 "gaps": [{{
   "title": "short gap title",
   "explanation": "2-3 plain sentences: what the gap is and why it matters",
   "done": "what the paper does that is related to this gap (1-2 sentences)",
   "limit": "the specific limitation (1-2 sentences)",
   "improve": "how a student could improve on it (1-2 sentences)",
   "impact": "High" or "Medium" or "Low",
   "impact_reason": "max 20 words",
   "quotes": [1-2 sentences copied EXACTLY, character for character, from the paper text below that show this gap; [] if none],
   "search_query": "4-8 keyword query to find other papers about this problem"
 }}]
}}
Quotes must be verbatim copies. Never paraphrase inside quotes.

PAPER TEXT:
"""{text}"""'''


def support(gaps_in: list[dict], per_gap: list[list[dict]]) -> str:
    blocks = []
    for g, cands in zip(gaps_in, per_gap):
        blocks.append(f"GAP {g['id']}: {g['title']}\nLimitation: {g['limit']}\nCandidate papers:\n{_papers(cands, 350)}")
    return '''For each gap, decide which candidate papers genuinely support it: they mention the same limitation, show the same open problem, or confirm it with their own results. Be strict. Do not include a paper that merely shares the topic. Never invent papers.

''' + "\n\n".join(blocks) + '''

Return JSON: {"gaps": [{"id": gap id, "supporting": [{"i": candidate number, "reason": "max 22 words on how it supports the gap"}]}]}'''


def experiment(g: dict) -> str:
    return f'''A student wants to overcome this research gap.

Gap: {g['title']}
Explanation: {g.get('explanation', '')}
What the paper does: {g.get('done', '')}
Limitation: {g.get('limit', '')}
Improvement idea: {g.get('improve', '')}

Design a complete, end-to-end experiment. Return JSON:
{{
 "summary": "3-4 plain sentences: how to overcome this gap, explained to a student",
 "objective": "one sentence",
 "methodology": "one paragraph describing the approach",
 "steps": [5-7 items {{"phase": "e.g. Data preparation", "tasks": [3-5 concrete tasks], "outcome": "what you have at the end of this phase"}} covering: data preparation, baseline reproduction, proposed method, training and hyperparameter setup, evaluation, ablation/error analysis, reporting],
 "datasets": [{{"name": "real, well-known dataset", "description": "what it contains", "why": "why it fits"}}],
 "baselines": [{{"name": "real, well-known method", "description": "one line"}}],
 "tools": [libraries, frameworks, hardware],
 "metrics": [{{"name": "metric", "why": "why it matters here"}}],
 "expected_contribution": "what the student can claim if it works",
 "risks": [2-4 things that could go wrong],
 "search_query": "4-8 keyword query to find reading material for this experiment"
}}
Only name datasets and baselines you are confident exist. Do not give URLs.'''


GUIDE = {
    "Abstract": "one paragraph of 150-220 words: problem, gap, method, result",
    "Introduction": "250-400 words: motivation, the gap, the proposed approach and a short list of contributions",
    "Literature Review": "300-500 words grouped by theme, ending by leading into the gap. Cite only with the numbered references provided, like [2]",
    "Methodology": "250-400 words describing the approach so it can be repeated",
    "Experimental Setup": "150-300 words: datasets, baselines, metrics, implementation details",
    "Results": "200-350 words presenting and discussing ONLY the results the student provided",
    "Conclusion": "150-250 words: what was done, findings, limitations, future work",
}


def section(name: str, f: dict, refs_text: str) -> str:
    guide = GUIDE.get(name, "a focused, well-structured section of 150-300 words")
    return f'''Write the "{name}" section of a research paper.
Target: {guide}.
Style: formal academic English, third person or "we". Use ONLY the facts below.
Where a needed fact is missing, write a short [bracketed placeholder] for the student to fill in. NEVER invent results, numbers, datasets or citations.

Title: {f.get('title', '')}
Research summary: {f.get('problem', '')}
Research gap: {f.get('gap', '')}
Methodology: {f.get('method', '')}
Dataset: {f.get('data', '')}
Metrics: {f.get('metrics', '')}
Student's results: {f.get('results', '')}
Numbered references available:
{refs_text or '(none)'}

Return JSON: {{"text": "the section text; use \\n\\n between paragraphs"}}'''
