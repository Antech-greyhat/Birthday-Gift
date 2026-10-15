"""Rich renderables shared by the command line and the full screen app."""

from __future__ import annotations

from datetime import date, datetime

from rich.align import Align
from rich.console import Group, RenderableType
from rich.panel import Panel
from rich.progress_bar import ProgressBar
from rich.table import Table
from rich.text import Text

from .banner import PALETTE, big_digits
from .core import astro
from .core import invitation as inv
from .core.countdown import MONTHS, date_facts, get_countdown, life_facts
from .share import qr
from .share.links import share_links

CORAL, SUN, MINT, SKY, LILAC = PALETTE


def _facts_table(rows: list[tuple[str, str]], title: str, color: str) -> Panel:
    table = Table.grid(padding=(0, 2))
    table.add_column(style="dim", no_wrap=True)
    table.add_column(style=f"bold {color}")
    for label, value in rows:
        table.add_row(label, value)
    return Panel(table, title=title, title_align="left", border_style=color, padding=(0, 1))


def countdown_view(name: str, month: int, day: int, year: int | None, now: datetime | None = None) -> RenderableType:
    now = now or datetime.now()
    cd = get_countdown(month, day, year, now)
    possessive = f"{name}'s"

    if cd.is_today:
        heading = Text(f"🎉 Happy birthday, {name}!", style=f"bold {CORAL}")
        if cd.age_today:
            heading.append(f"  {cd.age_today} today", style=f"bold {SUN}")
    else:
        heading = Text(
            f"{possessive} birthday is in {cd.total_days} {'day' if cd.total_days == 1 else 'days'}", style="bold"
        )

    clock = big_digits(f"{cd.days}:{cd.hours:02d}:{cd.minutes:02d}:{cd.seconds:02d}", CORAL)
    # Each big glyph is four columns wide, separators included
    gap = " " * 4
    units = Text(
        gap.join(["days".center(len(str(cd.days)) * 4), "hours".center(8), "mins".center(8), "secs".center(8)]),
        style="dim",
    )

    when = Text(f"{cd.next:%A}, {cd.next:%B} {cd.next.day}, {cd.next.year}", style=SUN)
    if cd.turning:
        when.append(f"  ·  turning {cd.turning}", style=f"bold {SUN}")
    when.append(f"  ·  {cd.sleeps} {'sleep' if cd.sleeps == 1 else 'sleeps'} to go", style="dim")

    progress = Table.grid(padding=(0, 1))
    progress.add_row(
        Text("Year so far", style="dim"),
        ProgressBar(total=1, completed=cd.year_progress, width=36, complete_style=MINT),
        Text(f"{cd.year_progress:.0%}", style=MINT),
    )

    sign = astro.zodiac_of(month, day)
    stone, stone_meaning = astro.BIRTHSTONES[month - 1]
    flower, flower_also, flower_meaning = astro.BIRTH_FLOWERS[month - 1]
    about = [
        ("Star sign", f"{sign.symbol} {sign.name}  ({sign.range})"),
        ("Element · planet", f"{sign.element} · {sign.planet}"),
        ("Traits", ", ".join(sign.traits)),
        ("Birthstone", f"{stone}, {stone_meaning.lower()}"),
        ("Birth flower", f"{flower} or {flower_also.lower()}, {flower_meaning.lower()}"),
    ]
    if year:
        birth = date(year, month, day)
        animal, approximate = astro.chinese_zodiac_of(year, month, day)
        about += [
            ("Chinese zodiac", f"{animal}{' (or the year before, near Lunar New Year)' if approximate else ''}"),
            ("Born on a", f"{birth:%A}: {astro.RHYME[birth.weekday()]}"),
            ("Generation", astro.generation_of(year)),
        ]

    panels: list[RenderableType] = [
        _facts_table(about, "About them", LILAC),
        _facts_table(date_facts(month, day, cd.next), "The date", SKY),
    ]
    if year:
        panels.append(_facts_table(life_facts(date(year, month, day), now), "Life so far", MINT))
    else:
        panels.append(Text("Add --year to unlock their age, Chinese zodiac and life stats.", style="dim italic"))

    body = Group(heading, Text(), clock, units, Text(), when, progress, Text(), *panels)
    return Panel(
        body,
        title=f"[bold]{name}[/]  ·  {MONTHS[month - 1]} {day}",
        title_align="left",
        border_style=CORAL,
        padding=(1, 2),
    )


def wish_view(message: str, name: str, sender: str, design: str) -> RenderableType:
    body = Text(message, style="italic")
    if sender:
        body.append(f"\n\n— {sender}", style=f"bold {LILAC}")
    title = f"A wish for {name}" if name else "A birthday wish"
    return Panel(
        body,
        title=title,
        title_align="left",
        subtitle=f"design: {design}",
        subtitle_align="right",
        border_style=LILAC,
        padding=(1, 2),
    )


def wish_list_view(items: list[tuple[int, str, str]]) -> RenderableType:
    table = Table(show_header=True, header_style="bold", box=None, padding=(0, 1), expand=True)
    table.add_column("#", style="dim", justify="right", no_wrap=True)
    table.add_column("Mood", style=LILAC, no_wrap=True)
    table.add_column("Message", ratio=1)
    for index, tone, text in items:
        table.add_row(str(index), tone, Text(text))
    return table


def invite_view(invite: inv.Invite) -> RenderableType:
    rows = Table.grid(padding=(0, 2))
    rows.add_column(style="dim", no_wrap=True)
    rows.add_column()
    for label, value in (
        ("Date", inv.fmt_date(invite.date)),
        ("Time", inv.time_range(invite)),
        ("Place", inv.place_line(invite)),
        ("Dress code", invite.dress.strip()),
        ("Good to know", invite.note.strip()),
        ("RSVP", inv.rsvp_line(invite)),
    ):
        if value:
            rows.add_row(label, Text(value, style="bold"))
    heading = Text(invite.headline.strip() or "You're invited", style=f"bold {MINT}")
    title = Text(inv.party_title(invite), style="bold")
    return Panel(
        Group(heading, title, Text(), rows),
        border_style=MINT,
        title="Invitation",
        title_align="left",
        subtitle=f"design: {invite.theme}",
        subtitle_align="right",
        padding=(1, 2),
    )


def qr_view(url: str, style: str = "compact", caption: str = "Scan with a phone camera") -> RenderableType:
    return Group(Align.left(qr.render(url, style)), Text(caption, style="dim"))


def share_view(
    url: str, text: str = "", *, show_qr: bool = True, qr_style: str = "compact", show_links: bool = False
) -> RenderableType:
    parts: list[RenderableType] = []
    if show_qr:
        parts.append(qr_view(url, qr_style))
        parts.append(Text())
    link = Text("Link  ", style="dim")
    link.append(url, style=f"bold {SKY} link {url}")
    parts.append(link)
    if show_links:
        table = Table.grid(padding=(0, 2))
        table.add_column(style="dim", no_wrap=True)
        table.add_column(overflow="fold")
        for network, href in share_links(text, url).items():
            table.add_row(network, Text(href, style=f"link {href}"))
        parts += [Text(), table]
    return Panel(Group(*parts), title="Share", title_align="left", border_style=SKY, padding=(1, 2))


def party_view(
    party, url: str, wall_url: str, qr_style: str = "compact", width: int = 200, stop_hint: str = "Ctrl+C to stop"
) -> RenderableType:
    """The host's live dashboard: the code to scan, who is coming and the latest wishes."""
    from .share.party import ANSWERS

    counts = party.counts()
    tally = Text()
    for key, color in (("yes", MINT), ("maybe", SUN), ("no", CORAL)):
        tally.append(f" {counts[key]} ", style=f"bold reverse {color}")
        tally.append(f" {ANSWERS[key].lower()}   ")

    guests = Table(box=None, padding=(0, 1), expand=True, show_header=True, header_style="dim")
    guests.add_column("Guest", style="bold", ratio=2, overflow="fold")
    guests.add_column("Answer", no_wrap=True)
    guests.add_column("People", justify="right", no_wrap=True)
    guests.add_column("Note", ratio=3, overflow="fold", style="dim")
    colors = {"yes": MINT, "maybe": SUN, "no": CORAL}
    for r in reversed(party.rsvps[-14:]):
        # Guest text goes in Text objects so square brackets are never read as markup
        guests.add_row(
            Text(r.name),
            Text(ANSWERS[r.answer], style=colors[r.answer]),
            str(r.guests) if r.guests else "–",
            Text(r.note),
        )
    if not party.rsvps:
        guests.add_row(Text("Waiting for the first RSVP…", style="dim italic"), "", "", "")

    wall = (
        Group(
            *(
                Text.assemble((f"“{w.message}”", "italic"), (f"  — {w.name}", f"bold {LILAC}"))
                for w in reversed(party.wishes[-6:])
            )
        )
        if party.wishes
        else Text("No wishes yet.", style="dim italic")
    )

    links = Table.grid(padding=(0, 1))
    links.add_column(style="dim", no_wrap=True)
    links.add_column(overflow="fold")
    links.add_row("Guests", Text(url, style=f"bold {SKY} link {url}"))
    links.add_row("Wall", Text(wall_url, style=f"{SKY} link {wall_url}"))

    left = Panel(
        Group(qr_view(url, qr_style, "Guests on this Wi-Fi scan to RSVP"), Text(), links),
        title="Scan to join",
        title_align="left",
        border_style=SKY,
        padding=(1, 2),
    )
    right = Group(
        Panel(Group(tally, Text(), guests), title=f"RSVPs · {len(party.rsvps)}", title_align="left", border_style=MINT),
        Panel(wall, title=f"Wish wall · {len(party.wishes)}", title_align="left", border_style=LILAC),
        Panel(
            Text("\n".join(party.log[-5:]) or "Activity shows up here.", style="dim"),
            title="Activity",
            title_align="left",
            subtitle=Text(f"saved in {party.path}"),
            subtitle_align="left",
            border_style="grey50",
        ),
    )
    title = Text.assemble(
        ("PARTY MODE  ", f"bold {CORAL}"), (inv.party_title(party.invite), "bold"), (f"   {stop_hint}", "dim")
    )
    # Side by side when there is room for the code and a readable guest list
    qr_columns = qr.width(url, qr_style) + 6
    if width < qr_columns + 60:
        return Group(title, left, right)
    layout = Table.grid(expand=True, padding=(0, 1))
    layout.add_column(width=max(qr_columns, 52))
    layout.add_column(ratio=1)
    layout.add_row(left, right)
    return Group(title, layout)
