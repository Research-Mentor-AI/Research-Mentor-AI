"""Tiny in-memory store so "Load more papers" can continue a search (lost on restart)."""
import time, uuid

_STORE: dict[str, dict] = {}
TTL = 3600


def put(user_id: int, pool: list[dict]) -> str:
    now = time.time()
    for k in [k for k, v in _STORE.items() if now - v["t"] > TTL]:
        del _STORE[k]
    if len(_STORE) > 300:
        _STORE.pop(min(_STORE, key=lambda k: _STORE[k]["t"]))
    sid = uuid.uuid4().hex
    _STORE[sid] = {"t": now, "u": user_id, "pool": pool}
    return sid


def get(user_id: int, sid: str):
    v = _STORE.get(sid)
    return v["pool"] if v and v["u"] == user_id else None
