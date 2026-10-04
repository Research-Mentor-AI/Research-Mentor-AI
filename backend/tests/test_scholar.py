import asyncio, httpx, pytest
from app import scholar

REAL_SEARCH = scholar.search_works   # captured before other tests swap in the fake index
WORK = {"id": "https://openalex.org/W1", "title": "A Real Paper", "publication_year": 2024, "publication_date": "2024-01-01", "cited_by_count": 3,
        "primary_location": {"source": {"type": "journal", "display_name": "J", "host_organization_name": "P"}, "landing_page_url": "https://x.org"},
        "abstract_inverted_index": {f"w{i}": [i] for i in range(30)}}


def test_api_key_is_sent_and_repeat_searches_are_cached(monkeypatch):
    seen = []
    client = httpx.AsyncClient(transport=httpx.MockTransport(lambda req: (seen.append(dict(req.url.params)), httpx.Response(200, json={"results": [WORK]}))[1]))
    monkeypatch.setattr(scholar.config, "OPENALEX_API_KEY", "k123")
    scholar._CACHE.clear()
    a = asyncio.run(REAL_SEARCH(client, "deep learning", 10, "journal"))
    b = asyncio.run(REAL_SEARCH(client, "deep learning", 10, "journal"))
    assert a == b and a[0]["type"] == "Journal" and len(seen) == 1 and seen[0]["api_key"] == "k123"


def test_rate_limit_is_explained(monkeypatch):
    async def boom(c, q, n=25, kind="journal"):
        raise httpx.HTTPStatusError("429", request=httpx.Request("GET", "x"), response=httpx.Response(429))
    monkeypatch.setattr(scholar, "search_works", boom)
    with pytest.raises(scholar.ScholarError) as e:
        asyncio.run(scholar.gather_candidates(["q"], 5))
    assert "OPENALEX_API_KEY" in str(e.value) and "midnight UTC" in str(e.value)


def test_network_failure_is_explained():
    assert "internet connection" in scholar.explain(httpx.ConnectError("down"))
