import datetime as dt, io
import docx
from fpdf import FPDF

PS = "How can deep learning detect road accidents reliably from CCTV footage?"
TEXT = ("Abstract. We detect accidents with a CNN. " * 8 + "Performance drops sharply as resolution falls and compression increases. " + "Conclusion. More work is needed. " * 20)


def test_auth(client):
    assert client.post("/api/explore/analyze", json={"problem_statement": PS}).status_code == 401
    r = client.post("/api/auth/signup", json={"name": "Amit Kumar", "email": "amit@x.com", "password": "secret1"})
    assert r.status_code == 200 and r.json()["user"]["name"] == "Amit Kumar"
    assert client.post("/api/auth/signup", json={"name": "A", "email": "amit@x.com", "password": "secret1"}).status_code == 409
    assert client.post("/api/auth/login", json={"email": "amit@x.com", "password": "wrong"}).status_code == 401
    t = client.post("/api/auth/login", json={"email": "AMIT@x.com", "password": "secret1"}).json()["token"]
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer " + t}).json()["user"]["email"] == "amit@x.com"


def test_explore_pagination(client, auth):
    r = client.post("/api/explore/analyze", json={"problem_statement": PS}, headers=auth).json()
    assert len(r["papers"]) == 10 and r["has_more"] and r["domain"] and r["objectives"]
    scores = [p["similarity"] for p in r["papers"]]
    assert scores == sorted(scores, reverse=True)
    assert {"title", "publisher", "year", "date", "type", "citations", "url", "venue"} <= set(r["papers"][0])
    m = client.get("/api/explore/papers", params={"search_id": r["search_id"], "offset": 10, "limit": 5}, headers=auth).json()
    assert len(m["papers"]) == 5 and m["papers"][0]["title"] != r["papers"][0]["title"]
    assert client.get("/api/explore/papers", params={"search_id": "nope"}, headers=auth).status_code == 404
    assert client.post("/api/explore/analyze", json={"problem_statement": "short"}, headers=auth).status_code == 422


def test_novelty(client, auth):
    r = client.post("/api/novelty/check", json={"problem_statement": PS}, headers=auth).json()
    assert r["score"] == 68 and r["verdict"] == "Medium novelty" and len(r["papers"]) >= 5
    assert r["papers"][0]["overlap"] >= r["papers"][-1]["overlap"] and r["venues"] and r["open_angles"]


def _upload(client, auth, name, data):
    return client.post("/api/gaps/detect", files={"file": (name, data)}, headers=auth)


def test_gaps_docx_quotes_verified_and_support(client, auth):
    d = docx.Document(); [d.add_paragraph(p.rstrip(".") + ".") for p in TEXT.split(". ")]; b = io.BytesIO(); d.save(b)
    r = _upload(client, auth, "paper.docx", b.getvalue()).json()
    assert r["paper"]["title"] and len(r["gaps"]) == 3
    g = r["gaps"][0]
    assert len(g["quotes"]) == 1 and g["quotes"][0].startswith("Performance drops sharply")   # invented quote was dropped
    assert len(g["support"]) == 2 and g["support"][0]["reason"] and g["support"][0]["url"].startswith("http")


def test_gaps_pdf_and_bad_files(client, auth):
    pdf = FPDF(); pdf.add_page(); pdf.set_font("Helvetica", size=10); pdf.multi_cell(0, 5, TEXT)
    assert _upload(client, auth, "p.pdf", bytes(pdf.output())).status_code == 200
    assert _upload(client, auth, "p.txt", b"hello").status_code == 415
    assert _upload(client, auth, "p.pdf", b"not a pdf").status_code == 422


def test_experiment(client, auth):
    gaps = [{"title": "Gap 1", "explanation": "e", "done": "d", "limit": "l", "improve": "i", "search_query": "q"}]
    p = client.post("/api/experiment/plan", json={"gaps": gaps}, headers=auth).json()["plans"]["Gap 1"]
    assert p["summary"] and p["steps"] and p["datasets"][0]["url"].startswith("https://datasetsearch") and len(p["resources"]) == 5
    assert client.post("/api/experiment/plan", json={"gaps": []}, headers=auth).status_code == 422


def test_writer(client, auth):
    f = {"title": "T", "problem": "P", "refs": ""}
    r = client.post("/api/writer/draft", json={"fields": f, "sections": ["Abstract", "Ethics", "References"]}, headers=auth).json()
    assert list(r) == ["Abstract", "Ethics", "References"] and "Drafted text" in r["Abstract"] and r["References"].startswith("Suggested references")
    f["refs"] = "Smith (2020). A paper."
    assert client.post("/api/writer/draft", json={"fields": f, "sections": ["References"]}, headers=auth).json()["References"] == "[1] Smith (2020). A paper."


def test_mentors_and_bookings(client, auth):
    m = {"name": "Dr. Test Mentor", "role": "Professor", "expertise": ["NLP"], "price": 500}
    assert client.post("/api/admin/mentors", json=m).status_code == 403
    mid = client.post("/api/admin/mentors", json=m, headers={"X-Admin-Key": "admin"}).json()["id"]
    assert client.get("/api/mentors", headers=auth).json()["mentors"][0]["initials"] == "TM"
    day = (dt.date.today() + dt.timedelta(days=2)).isoformat()
    assert client.post("/api/bookings", json={"mentor_id": mid, "date": day, "slot": "10:00 AM", "note": "hi"}, headers=auth).status_code == 200
    assert client.post("/api/bookings", json={"mentor_id": mid, "date": day, "slot": "10:00 AM"}, headers=auth).status_code == 409
    s = client.get(f"/api/mentors/{mid}/slots", params={"date": day}, headers=auth).json()["slots"]
    assert [x["booked"] for x in s][:2] == [False, True] or any(x["booked"] for x in s)
    assert client.get("/api/bookings", headers=auth).json()["bookings"][0]["mentor"] == "Dr. Test Mentor"
    assert client.post("/api/bookings", json={"mentor_id": mid, "date": "2020-01-01", "slot": "10:00 AM"}, headers=auth).status_code == 422
