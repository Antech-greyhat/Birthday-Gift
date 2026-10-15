from urllib.parse import parse_qs, urlsplit

from birthday_cli.core.invitation import sample_invite
from birthday_cli.share import qr
from birthday_cli.share.links import countdown_url, decode_data, encode_data, invite_url, share_links, wish_url


def query(url: str) -> dict[str, str]:
    fragment = urlsplit(url).fragment
    return {k: v[0] for k, v in parse_qs(fragment.split("?", 1)[1]).items()}


def test_encode_data_matches_the_web_app():
    # Produced by encodeData() in src/lib/url.js for the same object
    expected = "eyJuYW1lIjoiWm_DqyDwn46JIiwibm90ZSI6IkNha2UgJiBcImdhbWVzXCIvZnVuPyIsInRoZW1lIjoibmVvbiJ9"
    assert encode_data({"name": "Zoë 🎉", "note": 'Cake & "games"/fun?', "theme": "neon"}) == expected
    assert decode_data(expected)["name"] == "Zoë 🎉"
    assert decode_data("not base64!") is None


def test_countdown_url_uses_web_parameters(monkeypatch):
    monkeypatch.delenv("BDAY_BASE_URL", raising=False)
    url = countdown_url("Ava", 5, 14, 1998, "golden")
    assert url == "https://birthday-gift-wish.vercel.app/#/countdown?n=Ava&m=5&d=14&y=1998"
    assert query(countdown_url("Ava", 5, 14, None, "neon")) == {"n": "Ava", "m": "5", "d": "14", "t": "neon"}


def test_base_url_override(monkeypatch):
    monkeypatch.setenv("BDAY_BASE_URL", "http://localhost:5173/#/old")
    assert wish_url("Ava", "", "neon", "Hi").startswith("http://localhost:5173/#/wishes?view=1")


def test_wish_url_round_trip():
    q = query(wish_url(" Ava ", "Sam", "confetti", "Happy birthday, Ava & co!"))
    assert q == {"view": "1", "n": "Ava", "f": "Sam", "d": "confetti", "m": "Happy birthday, Ava & co!"}


def test_invite_url_packs_the_invitation():
    invite = sample_invite()
    packed = decode_data(query(invite_url(invite))["p"])
    assert packed["name"] == "Ava" and packed["theme"] == "balloons"
    assert "accent" not in packed  # empty fields are left out


def test_share_links_encode_everything():
    links = share_links("Hi & bye", "https://x.test/#/a?b=1")
    assert links["WhatsApp"] == "https://wa.me/?text=Hi%20%26%20bye%0Ahttps%3A%2F%2Fx.test%2F%23%2Fa%3Fb%3D1"


def test_qr_renders_in_every_style():
    url = "https://birthday-gift-wish.vercel.app/#/countdown?n=Ava&m=5&d=14"
    compact = qr.render(url, "compact").plain.splitlines()
    wide = qr.render(url, "wide").plain.splitlines()
    assert len(wide) == len(compact) * 2 or len(wide) == len(compact) * 2 - 1
    assert len(compact[0]) == qr.width(url) and len(wide[0]) == qr.width(url, "wide")
    assert set("".join(qr.render(url, "ascii").plain.split())) == {"#"}
