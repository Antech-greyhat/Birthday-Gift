"""Party invitations, ported from src/tools/invitation/details.js.

The field names match the web app exactly, so an Invite packs into the same
`#/invitation?view=1&p=...` link the site already knows how to open.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass, fields
from datetime import date, datetime, timedelta
from urllib.parse import quote

from .calendar import build_ics
from .themes import THEME_IDS, get_theme

FONTS = ("classic", "elegant", "playful", "bold")
MAX_FIELD = 200


@dataclass
class Invite:
    headline: str = ""
    name: str = ""
    age: str = ""
    date: str = ""
    time: str = ""
    endTime: str = ""
    venue: str = ""
    address: str = ""
    host: str = ""
    rsvp: str = ""
    rsvpBy: str = ""
    dress: str = ""
    note: str = ""
    theme: str = "balloons"
    accent: str = ""
    font: str = ""

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


FIELDS = [f.name for f in fields(Invite)]


def sample_invite(today: date | None = None) -> Invite:
    """The same example the web app loads: a party on the Saturday after next."""
    today = today or date.today()
    party = today + timedelta(days=(5 - today.weekday()) % 7 + 7)
    return Invite(
        headline="You're invited",
        name="Ava",
        age="7",
        date=party.isoformat(),
        time="16:00",
        endTime="19:00",
        venue="Sunny Park Pavilion",
        address="123 Garden Lane, Springfield",
        host="Emma & James",
        rsvp="+1 555 012 3456",
        rsvpBy=(party - timedelta(days=5)).isoformat(),
        dress="Wear something sparkly!",
        note="Cake, games and lots of fun",
        theme="balloons",
    )


def clean_invite(raw: object) -> Invite:
    """Keeps only known string fields, the same checks the web app runs on arrival."""
    invite = Invite()
    if isinstance(raw, dict):
        for name in FIELDS:
            value = raw.get(name)
            if isinstance(value, str):
                setattr(invite, name, value[:MAX_FIELD])
    invite.theme = get_theme(invite.theme).id
    if invite.accent and not re.fullmatch(r"#[0-9a-fA-F]{6}", invite.accent):
        invite.accent = ""
    if invite.font and invite.font not in FONTS:
        invite.font = ""
    return invite


def validate(invite: Invite) -> list[str]:
    """Human readable problems with the date and time fields, empty when all is well."""
    problems = []
    for label, value, fmt in (
        ("date", invite.date, "%Y-%m-%d"),
        ("RSVP by", invite.rsvpBy, "%Y-%m-%d"),
        ("start time", invite.time, "%H:%M"),
        ("end time", invite.endTime, "%H:%M"),
    ):
        if value:
            try:
                datetime.strptime(value, fmt)
            except ValueError:
                problems.append(f"The {label} '{value}' should look like {'2026-11-02' if 'Y' in fmt else '16:00'}")
    if invite.theme not in THEME_IDS:
        problems.append(f"Unknown design '{invite.theme}'")
    return problems


def ordinal(n: int) -> str:
    suffix = "th" if 10 <= n % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def fmt_time(value: str) -> str:
    if not value:
        return ""
    t = datetime.strptime(value, "%H:%M")
    return f"{t.hour % 12 or 12}:{t.minute:02d} {'AM' if t.hour < 12 else 'PM'}"


def time_range(invite: Invite) -> str:
    return " – ".join(filter(None, [fmt_time(invite.time), fmt_time(invite.endTime)]))


def fmt_date(value: str, short: bool = False) -> str:
    if not value:
        return ""
    d = date.fromisoformat(value)
    return f"{d:%b} {d.day}" if short else f"{d:%A}, {d:%B} {d.day}, {d.year}"


def party_title(invite: Invite) -> str:
    name = invite.name.strip()
    age = f"{ordinal(int(invite.age))} " if invite.age.strip().isdigit() and int(invite.age) > 0 else ""
    return f"{name}'s {age}Birthday Party" if name else f"{age}Birthday Party".strip()


def place_line(invite: Invite) -> str:
    return ", ".join(filter(None, [invite.venue.strip(), invite.address.strip()]))


def maps_url(invite: Invite) -> str:
    return f"https://www.google.com/maps/search/?api=1&query={quote(place_line(invite), safe='')}"


def rsvp_line(invite: Invite) -> str:
    parts = []
    if invite.host.strip():
        parts.append(f"RSVP to {invite.host.strip()}")
    elif invite.rsvp.strip() or invite.rsvpBy:
        parts.append("RSVP")
    if invite.rsvp.strip():
        parts.append(invite.rsvp.strip())
    line = " · ".join(parts)
    if invite.rsvpBy:
        line += f" by {fmt_date(invite.rsvpBy, short=True)}"
    return line


def invite_text(invite: Invite) -> str:
    """Plain text version for WhatsApp, SMS and email."""
    headline = invite.headline.strip() or "You're invited"
    lines = [f"🎉 {headline}! Join us for {party_title(invite)}", ""]
    if invite.date:
        lines.append(f"📅 {fmt_date(invite.date)}")
    if invite.time:
        lines.append(f"🕓 {time_range(invite)}")
    if place_line(invite):
        lines.append(f"📍 {place_line(invite)}")
    if invite.dress.strip():
        lines.append(f"👗 {invite.dress.strip()}")
    if invite.note.strip():
        lines.append(f"✨ {invite.note.strip()}")
    if rsvp_line(invite):
        lines += ["", rsvp_line(invite)]
    return "\n".join(lines)


def phone_digits(contact: str) -> str:
    """Phone number digits for a wa.me link, if the contact looks like one."""
    digits = re.sub(r"\D", "", contact)
    return digits if len(digits) >= 7 and "@" not in contact else ""


def invite_ics(invite: Invite, url: str = "") -> str:
    start = datetime.fromisoformat(f"{invite.date}T{invite.time or '12:00'}")
    end = datetime.fromisoformat(f"{invite.date}T{invite.endTime}") if invite.endTime else None
    if end and end <= start:
        end += timedelta(days=1)
    description = f"{invite_text(invite)}\n\n{url}" if url else invite_text(invite)
    return build_ics(party_title(invite), start, end, location=place_line(invite), description=description)
