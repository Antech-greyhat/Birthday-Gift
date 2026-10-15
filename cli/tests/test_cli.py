import json

from typer.testing import CliRunner

from birthday_cli.app import app
from birthday_cli.share.links import decode_data

runner = CliRunner()


def test_version_shows_the_banner():
    result = runner.invoke(app, ["--version"])
    assert result.exit_code == 0
    assert "╔╗" in result.output and "v2.0.0" in result.output


def test_countdown(tmp_path):
    ics = tmp_path / "ava.ics"
    result = runner.invoke(app, ["countdown", "Ava", "05-14", "--year", "1998", "--no-qr", "--ics", str(ics)])
    assert result.exit_code == 0, result.output
    assert "Taurus" in result.output and "#/countdown?n=Ava&m=5&d=14&y=1998" in result.output
    assert "RRULE:FREQ=YEARLY" in ics.read_text(encoding="utf-8")


def test_countdown_rejects_future_birth_year():
    result = runner.invoke(app, ["countdown", "Ava", "05-14", "--year", "2999"])
    assert result.exit_code == 1


def test_wish_pick_and_poster(tmp_path):
    poster = tmp_path / "wish.png"
    result = runner.invoke(
        app,
        [
            "wish",
            "--to",
            "Ava",
            "--from",
            "Sam",
            "--for",
            "mom",
            "--mood",
            "short",
            "--pick",
            "1",
            "--no-qr",
            "--poster",
            str(poster),
        ],
    )
    assert result.exit_code == 0, result.output
    assert poster.stat().st_size > 10_000


def test_wish_rejects_unknown_design():
    assert runner.invoke(app, ["wish", "--design", "nope"]).exit_code == 2


def test_invite_save_and_reload(tmp_path):
    saved = tmp_path / "party.json"
    result = runner.invoke(app, ["invite", "--example", "--name", "Mia", "--no-qr", "--save", str(saved)])
    assert result.exit_code == 0, result.output
    data = json.loads(saved.read_text(encoding="utf-8"))
    assert data["name"] == "Mia" and data["venue"] == "Sunny Park Pavilion"

    result = runner.invoke(app, ["invite", "--load", str(saved), "--no-qr", "--qr-file", str(tmp_path / "qr.svg")])
    assert result.exit_code == 0, result.output
    assert (tmp_path / "qr.svg").exists()


def test_invite_from_web_link():
    link = "https://birthday-gift-wish.vercel.app/#/invitation?view=1&p=eyJuYW1lIjoiWmF5ZCIsImRhdGUiOiIyMDI2LTEyLTAxIn0"
    assert decode_data(link.split("p=")[1]) == {"name": "Zayd", "date": "2026-12-01"}
    result = runner.invoke(app, ["invite", "--from-link", link, "--no-qr"])
    assert result.exit_code == 0, result.output
    assert "Zayd's Birthday Party" in result.output


def test_invite_validates_dates():
    assert runner.invoke(app, ["invite", "--name", "Ava", "--date", "2026-13-01"]).exit_code == 1


def test_list_catalogues():
    for what, expected in (("designs", "Golden Night"), ("recipients", "Best friend"), ("moods", "Heartfelt")):
        result = runner.invoke(app, ["list", what])
        assert result.exit_code == 0 and expected in result.output
