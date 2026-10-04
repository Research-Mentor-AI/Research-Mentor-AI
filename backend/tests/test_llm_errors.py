import asyncio, httpx, pytest
from app import llm


def run_with(status, payload):
    llm._client = httpx.AsyncClient(transport=httpx.MockTransport(lambda req: httpx.Response(status, json=payload)))
    return asyncio.run(llm.chat_json("s", "u", task="t"))


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
    assert asyncio.run(llm.chat_json("s", "u", max_tokens=6000)) == {"ok": 1} and seen["max_tokens"] == 1500
