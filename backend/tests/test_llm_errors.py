import asyncio, httpx, pytest
from app import llm

REAL_CHAT_JSON = llm.chat_json   # captured before other tests swap in the fake AI


def run_with(status, payload):
    llm._client = httpx.AsyncClient(transport=httpx.MockTransport(lambda req: httpx.Response(status, json=payload)))
    return asyncio.run(REAL_CHAT_JSON("s", "u", task="t"))


def test_402_shows_openrouter_message():
    with pytest.raises(llm.LLMError) as e:
        run_with(402, {"error": {"message": "This request requires more credits, or fewer max_tokens. You requested up to 6000 tokens, but can only afford 900."}})
    assert "can only afford 900" in str(e.value) and "openrouter.ai/credits" in str(e.value)


def test_max_tokens_is_capped(monkeypatch):
    seen = {}
    def h(req):
        import json; seen.update(json.loads(req.content)); return httpx.Response(200, json={"choices": [{"message": {"content": '{"ok": 1}'}}]})
    llm._client = httpx.AsyncClient(transport=httpx.MockTransport(h))
    monkeypatch.setattr(llm.config, "MAX_OUTPUT_TOKENS", 1500)
    assert asyncio.run(REAL_CHAT_JSON("s", "u", max_tokens=6000)) == {"ok": 1} and seen["max_tokens"] == 1500


def _flaky(skip):
    import re
    calls = []

    async def fake(system, user, **kw):
        n = len(calls); calls.append(1)
        idx = [int(i) for i in re.findall(r"^\[(\d+)\]", user, re.M)]
        keep = skip(n, idx)
        return {"scores": [{"i": i, "score": 70, "reason": "ok"} for i in keep]}
    return fake


CANDS = [{"title": f"t{i}", "year": 2024, "abstract": "x" * 100} for i in range(10)]


def test_skipped_papers_are_rescored(monkeypatch):
    from app.routers import explore
    monkeypatch.setattr(llm, "chat_json", _flaky(lambda n, idx: idx[:len(idx) // 2] if n == 0 else idx))
    out = asyncio.run(explore.rank_papers("problem", CANDS))
    assert len(out) == 10 and all(p["similarity"] == 70 and p["reason"] for p in out)


def test_never_scored_papers_are_dropped_not_zero(monkeypatch):
    from app.routers import explore
    monkeypatch.setattr(llm, "chat_json", _flaky(lambda n, idx: [i for i in idx if i % 2 == 0]))
    out = asyncio.run(explore.rank_papers("problem", CANDS))
    assert 0 < len(out) < 10 and all(p["similarity"] == 70 for p in out)


def test_cut_off_answer_is_retried_with_more_room(monkeypatch):
    import json
    seen = []

    def h(req):
        seen.append(json.loads(req.content)["max_tokens"])
        if len(seen) == 1:   # first answer is cut off mid-JSON
            return httpx.Response(200, json={"choices": [{"message": {"content": '{"a": [1, 2'}, "finish_reason": "length"}]})
        return httpx.Response(200, json={"choices": [{"message": {"content": '{"a": [1, 2]}'}, "finish_reason": "stop"}]})
    llm._client = httpx.AsyncClient(transport=httpx.MockTransport(h))
    monkeypatch.setattr(llm.config, "MAX_OUTPUT_TOKENS", 6000)
    assert asyncio.run(REAL_CHAT_JSON("s", "u", max_tokens=800)) == {"a": [1, 2]}
    assert seen == [800, 1600]
