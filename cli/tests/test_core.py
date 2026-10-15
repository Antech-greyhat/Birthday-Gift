from datetime import date, datetime

import pytest

from birthday_cli.core import astro
from birthday_cli.core import invitation as inv
from birthday_cli.core import wishes as wl
from birthday_cli.core.countdown import compact, date_facts, get_countdown, parse_month_day


def test_countdown_counts_to_next_birthday():
    cd = get_countdown(5, 14, 1998, datetime(2026, 10, 15, 12, 0))
    assert cd.next == date(2027, 5, 14)
    assert cd.turning == 29
    assert (cd.days, cd.hours) == (210, 12)
    assert not cd.is_today


def test_countdown_on_the_day_moves_to_next_year():
    cd = get_countdown(10, 15, 2000, datetime(2026, 10, 15, 9, 30))
    assert cd.is_today
    assert cd.age_today == 26
    assert cd.next == date(2027, 10, 15)


def test_leap_day_birthday_falls_on_feb_28_in_common_years():
    assert get_countdown(2, 29, None, datetime(2026, 1, 1)).next == date(2026, 2, 28)
    assert get_countdown(2, 29, None, datetime(2027, 3, 1)).next == date(2028, 2, 29)


@pytest.mark.parametrize(
    "raw, expected", [("03-14", (3, 14)), ("3/14", (3, 14)), ("1998-03-14", (3, 14)), ("02-29", (2, 29))]
)
def test_parse_month_day(raw, expected):
    assert parse_month_day(raw) == expected


@pytest.mark.parametrize("raw", ["13-01", "02-30", "march", ""])
def test_parse_month_day_rejects_bad_dates(raw):
    with pytest.raises(ValueError):
        parse_month_day(raw)


def test_compact_numbers_match_intl_format():
    assert compact(8.1e9 / 365.25) == "22.2 million"
    assert compact(1_200_000_000) == "1.2 billion"
    assert compact(950) == "950"


def test_date_facts():
    facts = dict(date_facts(8, 31, date(2027, 8, 31)))
    assert facts["Half birthday"] == "February 28"
    assert facts["Day of the year"] == "#243"


@pytest.mark.parametrize(
    "month, day, sign", [(1, 19, "Capricorn"), (1, 20, "Aquarius"), (12, 22, "Capricorn"), (7, 23, "Leo")]
)
def test_zodiac(month, day, sign):
    assert astro.zodiac_of(month, day).name == sign


def test_chinese_zodiac_flags_lunar_new_year():
    assert astro.chinese_zodiac_of(1998, 5, 14) == ("Tiger", False)
    assert astro.chinese_zodiac_of(1998, 1, 10) == ("Ox", False)
    assert astro.chinese_zodiac_of(1998, 2, 1) == ("Tiger", True)


def test_wish_library_matches_the_web_app():
    assert len(wl.messages()) == 216
    assert len(wl.recipients()) == 15
    found = wl.filter_messages("mom", "funny")
    assert found and all(m.tone == "funny" and m.to in ("mom", "anyone") for m in found)
    assert found[0].to == "mom"


def test_personalize():
    text = "Happy birthday, {name}! {name}, you rock."
    assert wl.personalize(text, "Ava") == "Happy birthday, Ava! Ava, you rock."
    assert wl.personalize(text, "", "mom") == "Happy birthday, Mom! Mom, you rock."
    assert wl.personalize(text, "", "anyone") == "Happy birthday! You rock."


def test_invite_text_and_title():
    d = inv.Invite(
        name="Ava",
        age="7",
        date="2026-10-24",
        time="16:00",
        endTime="19:00",
        venue="Park",
        host="Emma",
        rsvp="+1 555 012 3456",
    )
    assert inv.party_title(d) == "Ava's 7th Birthday Party"
    text = inv.invite_text(d)
    assert "Saturday, October 24, 2026" in text
    assert "4:00 PM – 7:00 PM" in text
    assert inv.phone_digits(d.rsvp) == "15550123456"
    assert inv.ordinal(11) == "11th" and inv.ordinal(22) == "22nd"


def test_clean_invite_drops_unknown_and_bad_values():
    d = inv.clean_invite({"name": "x" * 500, "theme": "nope", "accent": "red", "font": "comic", "evil": "<script>"})
    assert len(d.name) == 200
    assert d.theme == "confetti"
    assert d.accent == "" and d.font == ""
    assert not hasattr(d, "evil")


def test_invite_ics_wraps_past_midnight():
    d = inv.Invite(name="Ava", date="2026-10-24", time="22:00", endTime="01:00")
    ics = inv.invite_ics(d)
    assert "DTSTART:20261024T220000" in ics and "DTEND:20261025T010000" in ics
