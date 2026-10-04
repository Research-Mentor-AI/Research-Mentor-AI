"""OpenRouter client. Every AI answer in the app goes through chat_json()."""
import asyncio, json, re
import httpx
from . import config


class LLMError(Exception):
    pass


_client: httpx.AsyncClient | None = None


def _http() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=httpx.Timeout(150, connect=15))
    return _client


def parse_json(text: str) -> dict:
    text = (text or "").strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.I)
    try:
        return json.loads(text)
    except ValueError:
        a, b = text.find("{"), text.rfind("}")
        if a >= 0 and b > a:
            return json.loads(text[a:b + 1])
        raise


def _content(data: dict) -> str:
    msg = data["choices"][0]["message"].get("content")
    if isinstance(msg, list):
        msg = "".join(p.get("text", "") for p in msg if isinstance(p, dict))
    return msg or ""


async def chat_json(system: str, user: str, *, task: str = "", model: str | None = None,
                    max_tokens: int = 4000, temperature: float = 0.3) -> dict:
    """Ask the model for a JSON object. `task` is only a label (logs / tests)."""
    if not config.OPENROUTER_API_KEY:
        raise LLMError("OPENROUTER_API_KEY is not set on the server.")
    body = {"model": model or config.MODEL, "max_tokens": min(max_tokens, config.MAX_OUTPUT_TOKENS), "temperature": temperature,
            "response_format": {"type": "json_object"},
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]}
    headers = {"Authorization": f"Bearer {config.OPENROUTER_API_KEY}", "HTTP-Referer": config.APP_URL, "X-Title": "Research Mentor AI"}
    last = "unknown error"
    for attempt in range(4):
        try:
            r = await _http().post(f"{config.OPENROUTER_BASE}/chat/completions", json=body, headers=headers)
        except httpx.HTTPError as e:
            last = f"network error ({type(e).__name__})"
            await asyncio.sleep(1.5 * (attempt + 1))
            continue
        if r.status_code == 400 and "response_format" in body:   # model without JSON mode
            body.pop("response_format")
            continue
        if r.status_code == 401:
            raise LLMError("OpenRouter rejected the API key.")
        if r.status_code == 402:
            try:
                detail = r.json()["error"]["message"]
            except (ValueError, KeyError, TypeError):
                detail = "payment required"
            raise LLMError(f"OpenRouter says: {detail} Add credits at openrouter.ai/credits, "
                           "or set a cheaper OPENROUTER_MODEL / a lower MAX_OUTPUT_TOKENS in backend/.env.")
        if r.status_code in (408, 429, 500, 502, 503, 504):
            last = f"OpenRouter busy ({r.status_code})"
            await asyncio.sleep(2 * (attempt + 1))
            continue
        if r.status_code >= 400:
            raise LLMError(f"OpenRouter error {r.status_code}: {r.text[:200]}")
        try:
            return parse_json(_content(r.json()))
        except (ValueError, KeyError, IndexError):
            last = "the model returned invalid JSON"
            body["temperature"] = 0.1
    raise LLMError(f"The AI could not complete this request: {last}. Please try again.")
