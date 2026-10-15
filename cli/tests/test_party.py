import json
import time
import urllib.request
from urllib.error import HTTPError
from urllib.parse import urlencode

import pytest

from birthday_cli.core.invitation import sample_invite
from birthday_cli.share import party as party_mod
from birthday_cli.share.party import Party, PartyServer, render_wall_page


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


@pytest.fixture
def server(tmp_path, monkeypatch):
    monkeypatch.setattr(party_mod, "POST_COOLDOWN", 0)
    srv = PartyServer(Party.open(sample_invite(), tmp_path / "party.json"), "127.0.0.1", 0).start()
    yield srv
    srv.stop()


def post(url: str, data: dict) -> str:
    opener = urllib.request.build_opener(NoRedirect)
    with pytest.raises(HTTPError) as redirect:
        opener.open(url, urlencode(data).encode())
    assert redirect.value.code == 303
    return redirect.value.headers["Location"]


def test_pages_need_the_token(server):
    with urllib.request.urlopen(server.url) as res:
        assert res.status == 200
        assert "Ava&#x27;s 7th Birthday Party" in res.read().decode()
        assert "default-src 'none'" in res.headers["Content-Security-Policy"]
    for wrong in (f"http://127.0.0.1:{server.port}/", f"http://127.0.0.1:{server.port}/nope/"):
        with pytest.raises(HTTPError) as err:
            urllib.request.urlopen(wrong)
        assert err.value.code == 404


def test_rsvp_and_wish_flow(server):
    assert post(server.url + "rsvp", {"name": "Liam", "answer": "yes", "guests": "3"}).endswith("?done=rsvp#rsvp")
    assert post(server.url + "rsvp", {"name": "liam", "answer": "maybe", "guests": "1"}).endswith("?done=rsvp#rsvp")
    assert post(server.url + "rsvp", {"name": "Kai", "answer": "bogus"}).endswith("?done=error#rsvp")
    assert post(server.url + "wish", {"name": "Noor", "message": "Happy 7th!"}).endswith("?done=wish#wish")

    with urllib.request.urlopen(server.url + "api/state") as res:
        state = json.loads(res.read())
    assert state["counts"] == {"yes": 0, "maybe": 1, "no": 0}  # the second reply replaced the first
    assert state["wishes"] == [{"name": "Noor", "message": "Happy 7th!"}]

    saved = json.loads(server.party.path.read_text(encoding="utf-8"))
    assert saved["token"] == server.party.token and len(saved["rsvps"]) == 1


def test_posts_are_rate_limited(server, monkeypatch):
    monkeypatch.setattr(party_mod, "POST_COOLDOWN", 60)
    post(server.url + "wish", {"message": "one"})
    assert post(server.url + "wish", {"message": "two"}).endswith("?done=slow")


def test_reopening_keeps_token_and_replies(tmp_path):
    first = Party.open(sample_invite(), tmp_path / "p.json")
    first.add_wish("Liam", "Hello")
    again = Party.open(sample_invite(), tmp_path / "p.json")
    assert again.token == first.token and len(again.wishes) == 1
    assert Party.open(sample_invite(), tmp_path / "p.json", fresh=True).token != first.token


def test_wall_escapes_guest_text(tmp_path):
    p = Party.open(sample_invite(), tmp_path / "p.json")
    p.add_wish("<b>x</b>", "</script><script>alert(1)</script>")
    page = render_wall_page(p)
    assert "<script>alert" not in page and "</script><script>" not in page


def test_server_listens_and_stops(tmp_path):
    srv = PartyServer(Party.open(sample_invite(), tmp_path / "p.json"), "127.0.0.1", 0).start()
    port = srv.port
    srv.stop()
    time.sleep(0.05)
    with pytest.raises(OSError):
        urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=1)
