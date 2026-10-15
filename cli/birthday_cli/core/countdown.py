"""Countdown maths, ported from src/tools/countdown/time.js.

Months are 1 based. Everything uses naive local time, like the browser does.
"""

from __future__ import annotations

import calendar
import math
from dataclasses import dataclass
from datetime import date, datetime

from .calendar import build_ics

MONTHS = list(calendar.month_name)[1:]
DAY = 86400


def is_leap(year: int) -> bool:
    return calendar.isleap(year)


def days_in_month(month: int, year: int = 2024) -> int:
    return calendar.monthrange(year, month)[1]


def birthday_in(year: int, month: int, day: int) -> date:
    """Leap day birthdays are celebrated on Feb 28 in common years."""
    if month == 2 and day == 29 and not is_leap(year):
        return date(year, 2, 28)
    return date(year, month, day)


def parse_month_day(value: str) -> tuple[int, int]:
    """Accepts MM-DD, MM/DD or a full YYYY-MM-DD and returns (month, day)."""
    parts = value.replace("/", "-").split("-")
    if len(parts) == 3:
        parts = parts[1:]
    if len(parts) != 2 or not all(p.isdigit() for p in parts):
        raise ValueError(f"'{value}' is not a date, use MM-DD such as 03-14")
    month, day = int(parts[0]), int(parts[1])
    if not 1 <= month <= 12:
        raise ValueError("The month must be between 1 and 12")
    if not 1 <= day <= days_in_month(month):
        raise ValueError(f"{MONTHS[month - 1]} has no day {day}")
    return month, day


@dataclass(frozen=True)
class Countdown:
    is_today: bool
    next: date
    days: int
    hours: int
    minutes: int
    seconds: int
    total_days: int
    sleeps: int
    year_progress: float
    turning: int | None
    age_today: int | None


def get_countdown(month: int, day: int, birth_year: int | None, now: datetime) -> Countdown:
    today = now.date()
    nxt = birthday_in(today.year, month, day)
    is_today = nxt == today
    if nxt < today or is_today:
        nxt = birthday_in(today.year + 1, month, day)
    last = today if is_today else birthday_in(nxt.year - 1, month, day)

    target = datetime.combine(nxt, datetime.min.time())
    diff = max(0.0, (target - now).total_seconds())
    span = (nxt - last).days * DAY
    elapsed = (now - datetime.combine(last, datetime.min.time())).total_seconds()
    turning = nxt.year - birth_year if birth_year else None

    return Countdown(
        is_today=is_today,
        next=nxt,
        days=int(diff // DAY),
        hours=int(diff % DAY // 3600),
        minutes=int(diff % 3600 // 60),
        seconds=int(diff % 60),
        total_days=math.ceil(diff / DAY),
        sleeps=(nxt - today).days,
        year_progress=min(1.0, elapsed / span),
        turning=turning if turning and turning > 0 else None,
        age_today=today.year - birth_year if is_today and birth_year else None,
    )


def compact(value: float) -> str:
    """Matches Intl.NumberFormat('en', {notation: 'compact', compactDisplay: 'long'})."""
    for size, word in ((1e12, "trillion"), (1e9, "billion"), (1e6, "million"), (1e3, "thousand")):
        if abs(value) >= size:
            text = f"{value / size:.1f}".rstrip("0").rstrip(".")
            return f"{text} {word}"
    return f"{value:.1f}".rstrip("0").rstrip(".")


def date_facts(month: int, day: int, nxt: date) -> list[tuple[str, str]]:
    """Fun facts that only need the month and day."""
    day_of_year = birthday_in(nxt.year, month, day).timetuple().tm_yday
    half_month = (month + 5) % 12 + 1
    half = date(2001, half_month, min(day, days_in_month(half_month, 2001)))
    return [
        ("Next birthday falls on a", nxt.strftime("%A")),
        ("Half birthday", f"{half:%B} {half.day}"),
        ("Day of the year", f"#{day_of_year}"),
        ("People sharing this birthday", f"~{compact(8.1e9 / 365.25)}"),
    ]


def life_facts(birth: date, now: datetime) -> list[tuple[str, str]]:
    """Life stats that need the birth year."""
    seconds = (now - datetime.combine(birth, datetime.min.time())).total_seconds()
    days = int(seconds // DAY)
    minutes = seconds / 60
    years = seconds / (DAY * 365.25)
    leap_days = sum(1 for y in range(birth.year, now.year + 1) if is_leap(y) and birth <= date(y, 2, 29) <= now.date())
    return [
        ("Days on Earth", f"{days:,}"),
        ("Hours lived", f"{int(seconds // 3600):,}"),
        ("Heartbeats", compact(minutes * 80)),
        ("Breaths taken", compact(minutes * 16)),
        ("Full moons seen", f"{int(days / 29.53):,}"),
        ("Km travelled around the Sun", compact(years * 940e6)),
        ("Years spent sleeping", f"{years / 3:.1f}"),
        ("Leap days lived", f"{leap_days:,}"),
    ]


def birthday_ics(name: str, month: int, day: int, now: datetime, url: str = "") -> str:
    """A yearly all-day reminder, the same event the web app downloads."""
    start = get_countdown(month, day, None, now).next
    return build_ics(f"{name}'s Birthday 🎂", start, all_day=True, yearly=True, description=url, now=now)
