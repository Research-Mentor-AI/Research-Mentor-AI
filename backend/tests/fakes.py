"""Stand-ins for OpenRouter and OpenAlex, used ONLY by tests and the offline demo server."""
import re


async def fake_chat_json(system, user, *, task="", model=None, max_tokens=0, temperature=0):
    idx = [int(i) for i in re.findall(r"^\[(\d+)\]", user, re.M)]
    if task == "explore":
        return {"domain": ["Computer Vision", "Intelligent Transportation"], "understanding": "You want to detect accidents automatically from video.",
                "objectives": ["Detect accidents", "Work at night"], "questions": ["How does video quality matter?"], "datasets": ["CCD", "DoTA"],
                "methodology": "Use a video transformer.", "challenges": ["Rare events"], "contributions": ["A robustness benchmark"],
                "search_queries": ["accident detection video", "traffic crash recognition cctv", "spatiotemporal anomaly traffic"]}
    if task == "queries":
        return {"core_idea": "Detect road accidents in video", "search_queries": ["accident detection video", "crash recognition deep learning"]}
    if task == "rank":
        return {"scores": [{"i": i, "score": max(5, 95 - i * 2), "reason": f"Related to paper {i}"} for i in idx]}
    if task == "novelty":
        return {"score": 68, "summary": "Some overlap exists but night-time coverage is thin.", "already_done": ["Daytime detection is well covered [0]"],
                "open_angles": ["Low-light robustness"], "stand_out": ["Add a cross-dataset test"],
                "papers": [{"i": i, "overlap": 90 - i * 5, "how": f"Overlaps on detection ({i})"} for i in idx[:8]]}
    if task == "gaps":
        sentence = re.search(r"(Performance drops sharply[^.]*\.)", user)
        quotes = ([sentence.group(1)] if sentence else []) + ["This sentence is invented and does not appear in the paper at all."]
        gap = lambda n: {"title": f"Gap {n}", "explanation": "Brief explanation.", "done": "The paper does X.", "limit": "It fails on Y.", "improve": "Try Z.",
                         "impact": "High", "impact_reason": "Matters a lot", "quotes": quotes, "search_query": f"gap {n} topic"}
        return {"paper": {"title": "A Test Paper on Accident Detection", "summary": "It detects accidents."}, "gaps": [gap(1), gap(2), gap(3)]}
    if task == "support":
        return {"gaps": [{"id": g, "supporting": [{"i": 0, "reason": "Reports the same limitation"}, {"i": 1, "reason": "Confirms it"}, {"i": 99, "reason": "bad index"}]} for g in range(6)]}
    if task == "experiment":
        return {"summary": "Fine-tune a robust model.", "objective": "Improve recall.", "methodology": "Augment and fine-tune.",
                "steps": [{"phase": "Data preparation", "tasks": ["Download data", "Clean it"], "outcome": "Ready dataset"}],
                "datasets": [{"name": "CCD", "description": "Crash clips", "why": "Fits"}], "baselines": [{"name": "CNN-LSTM", "description": "Classic"}],
                "tools": ["PyTorch"], "metrics": [{"name": "F1", "why": "Imbalanced"}], "expected_contribution": "A benchmark", "risks": ["Little data"], "search_query": "robust accident detection"}
    if task == "writer":
        name = re.search(r'Write the "(.+?)" section', user).group(1)
        return {"text": f"Drafted text for {name}."}
    raise AssertionError(f"unexpected task {task}")


async def fake_search_works(client, query, per_page=25):
    key = abs(hash(query)) % 9999
    return [{"id": f"W{key}-{i}", "title": f"{query.title()} study {i}", "abstract": "This paper studies the problem in depth. " * 5, "year": 2025 - i % 4,
             "date": f"{2025 - i % 4}-03-1{i % 9}", "citations": 300 - i * 7, "venue": ["IEEE Access", "CVPR", "arXiv"][i % 3], "publisher": ["IEEE", "IEEE", "arXiv"][i % 3],
             "type": ["Journal", "Conference", "Preprint"][i % 3], "url": f"https://example.org/{key}/{i}", "doi": f"https://doi.org/10.1/{key}.{i}", "authors": "A. Author, B. Writer"}
            for i in range(12)]
