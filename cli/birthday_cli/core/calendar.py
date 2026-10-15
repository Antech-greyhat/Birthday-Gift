"""Calendar (.ics) files, the same shape as src/lib/calendar.js."""

from __future__ import annotations

import re
import secrets
from datetime import date, datetime, timedelta


def _escape(text: str) -> str:
    return re.sub(r"([,;\\])", r"\\\1", text).replace("\n", "\\n")


def _stamp(value: date | datetime) -> str:
    if isinstance(value, datetime):
        return value.strftime("%Y%m%dT%H%M00")
    return value.strftime("%Y%m%d")


def build_ics(
    title: str,
    start: date | datetime,
    end: date | datetime | None = None,
    *,
    all_day: bool = False,
    yearly: bool = False,
    location: str = "",
    description: str = "",
    now: datetime | None = None,
) -> str:
    now = now or datetime.now()
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Birthday Studio//EN",
        "BEGIN:VEVENT",
        f"UID:{int(now.timestamp() * 1000)}-{secrets.token_hex(4)}@birthday-studio",
        f"DTSTAMP:{_stamp(now)}",
    ]
    if all_day:
        day = start.date() if isinstance(start, datetime) else start
        lines += [f"DTSTART;VALUE=DATE:{_stamp(day)}", f"DTEND;VALUE=DATE:{_stamp(day + timedelta(days=1))}"]
    else:
        lines += [f"DTSTART:{_stamp(start)}", f"DTEND:{_stamp(end or start + timedelta(hours=3))}"]
    if yearly:
        lines.append("RRULE:FREQ=YEARLY")
    lines.append(f"SUMMARY:{_escape(title)}")
    if location:
        lines.append(f"LOCATION:{_escape(location)}")
    if description:
        lines.append(f"DESCRIPTION:{_escape(description)}")
    lines += ["BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", f"DESCRIPTION:{_escape(title)}", "END:VALARM"]
    lines += ["END:VEVENT", "END:VCALENDAR"]
    return "\r\n".join(lines) + "\r\n"
