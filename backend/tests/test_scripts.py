import json
from app import db
from scripts.add_mentors import add_mentors


def test_add_mentors_skips_placeholders_and_duplicates(tmp_path):
    f = tmp_path / "m.json"
    f.write_text(json.dumps([
        {"name": "REPLACE WITH MENTOR 1 NAME", "role": "x", "expertise": ["a"]},
        {"name": "Dr. Real Person", "role": "Professor", "expertise": ["NLP"], "price": 500},
        {"name": "No Role Person", "expertise": ["NLP"]},
    ]))
    assert add_mentors(f) == 1
    assert add_mentors(f) == 0   # running again adds nothing
    row = db.run("SELECT * FROM mentors WHERE name=?", ("Dr. Real Person",), one=True)
    assert row["price"] == 500 and json.loads(row["slots"])[0] == "09:00 AM"
