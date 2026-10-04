"""Add mentors to the database.

1. Edit scripts/mentors.json (put real mentor names, roles, expertise and session price in rupees).
2. From the backend folder run:   python -m scripts.add_mentors
Safe to run again: a mentor whose name already exists is skipped.
"""
import json
import pathlib
import sys

from app import db

DEFAULT_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "05:00 PM"]


def add_mentors(path=None) -> int:
    db.init()
    path = pathlib.Path(path or pathlib.Path(__file__).with_name("mentors.json"))
    added = 0
    for m in json.loads(path.read_text(encoding="utf-8")):
        name = str(m.get("name", "")).strip()
        if not name or name.upper().startswith("REPLACE"):
            print(f"skipped (still a placeholder, edit {path.name}): {name or '(no name)'}")
            continue
        if not m.get("role") or not m.get("expertise"):
            print(f"skipped (needs a role and expertise): {name}")
            continue
        if db.run("SELECT id FROM mentors WHERE name=?", (name,), one=True):
            print(f"skipped (already exists): {name}")
            continue
        db.run("INSERT INTO mentors(name,role,bio,expertise,price,rating,slots) VALUES (?,?,?,?,?,?,?)",
               (name, m["role"], m.get("bio", ""), json.dumps(m["expertise"]), int(m.get("price", 0)), m.get("rating"),
                json.dumps(m.get("slots", DEFAULT_SLOTS))), write=True)
        print(f"added: {name}")
        added += 1
    print(f"Done. {added} mentor(s) added.")
    return added


if __name__ == "__main__":
    add_mentors(sys.argv[1] if len(sys.argv) > 1 else None)
