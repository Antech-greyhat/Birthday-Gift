"""The `bday` command."""

from __future__ import annotations

import json
import random
import sys
import time
import webbrowser
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Annotated, Optional
from urllib.parse import parse_qs, urlsplit

import typer
from rich.console import Console
from rich.live import Live
from rich.table import Table
from rich.text import Text

from . import views
from .banner import banner
from .core import invitation as inv
from .core import wishes as wl
from .core.countdown import MONTHS, birthday_ics, birthday_in, get_countdown, parse_month_day
from .core.themes import THEME_IDS, THEMES
from .render.poster import render_poster
from .share import qr
from .share.links import countdown_url, decode_data, invite_url, wish_url

app = typer.Typer(
    name="bday",
    help="Birthday Studio in your terminal: countdowns, wishes, invitations and Party Mode.",
    add_completion=False,
    rich_markup_mode="rich",
    context_settings={"help_option_names": ["-h", "--help"]},
)
console = Console()


class QrStyle(str, Enum):
    compact = "compact"
    wide = "wide"
    ascii = "ascii"


def _choice(allowed: list[str], what: str):
    def check(value: Optional[str]) -> Optional[str]:
        if value is not None and value not in allowed:
            raise typer.BadParameter(f"Unknown {what} '{value}'. Pick one of: {', '.join(allowed)}")
        return value

    return check


def _fail(message: str) -> None:
    console.print(Text.assemble(("✗ ", "bold red"), message))
    raise typer.Exit(1)


def _done(message: str) -> None:
    console.print(Text.assemble(("✓ ", "bold green"), message))


Design = Annotated[
    str,
    typer.Option("--design", "-d", help="Card design, see `bday list designs`.", callback=_choice(THEME_IDS, "design")),
]
ShowQr = Annotated[bool, typer.Option("--qr/--no-qr", help="Print a QR code that opens the card on a phone.")]
Style = Annotated[
    QrStyle, typer.Option("--qr-style", help="compact (default), wide for stubborn scanners, ascii for plain text.")
]
Links = Annotated[
    bool, typer.Option("--links", help="Also print WhatsApp, Telegram, X, Facebook and email share links.")
]
Poster = Annotated[
    Optional[Path], typer.Option("--poster", help="Save a printable PNG with the QR code on it.", dir_okay=False)
]
QrFile = Annotated[
    Optional[Path], typer.Option("--qr-file", help="Save the QR code alone as PNG or SVG.", dir_okay=False)
]
Open = Annotated[bool, typer.Option("--open", help="Open the card in your browser.")]


def _share(
    url: str, text: str, show_qr: bool, qr_style: QrStyle, links: bool, qr_file: Optional[Path], open_it: bool
) -> None:
    console.print(views.share_view(url, text, show_qr=show_qr, qr_style=qr_style.value, show_links=links))
    if qr_file:
        _done(f"QR code saved to {qr.save(url, qr_file)}")
    if open_it:
        webbrowser.open(url)


@app.callback(invoke_without_command=True)
def root(
    ctx: typer.Context,
    version: Annotated[bool, typer.Option("--version", "-V", help="Show the version and exit.")] = False,
) -> None:
    """Run [bold]bday[/] with no command to open the full screen app."""
    if version:
        console.print(banner())
        raise typer.Exit()
    if ctx.invoked_subcommand is None:
        if console.is_terminal:
            from .tui.app import run

            run()
        else:
            console.print(banner())
            console.print(ctx.get_help())


@app.command()
def tui() -> None:
    """Open the full screen terminal app."""
    from .tui.app import run

    run()


@app.command()
def countdown(
    name: Annotated[str, typer.Argument(help="Whose birthday it is.")],
    when: Annotated[str, typer.Argument(help="Their birthday as MM-DD, for example 03-14.", metavar="MM-DD")],
    year: Annotated[Optional[int], typer.Option("--year", "-y", help="Birth year, unlocks age and life stats.")] = None,
    design: Design = "golden",
    live: Annotated[bool, typer.Option("--live", "-l", help="Keep the clock ticking until Ctrl+C.")] = False,
    ics: Annotated[
        Optional[Path], typer.Option("--ics", help="Save a yearly calendar reminder (.ics).", dir_okay=False)
    ] = None,
    show_qr: ShowQr = True,
    qr_style: Style = QrStyle.compact,
    links: Links = False,
    poster: Poster = None,
    qr_file: QrFile = None,
    open_it: Open = False,
) -> None:
    """Count down to a birthday, with star sign, birthstone and fun facts."""
    name = name.strip()
    if not name:
        _fail("Add their name, for example: bday countdown Ava 05-14")
    try:
        month, day = parse_month_day(when)
    except ValueError as err:
        _fail(str(err))
    now = datetime.now()
    if year is not None:
        if not 1900 <= year <= now.year:
            _fail(f"Enter a year between 1900 and {now.year}")
        if birthday_in(year, month, day) > now.date():
            _fail(f"{MONTHS[month - 1]} {day}, {year} hasn't happened yet")

    url = countdown_url(name, month, day, year, design)
    if live:
        try:
            with Live(
                views.countdown_view(name, month, day, year), console=console, refresh_per_second=4, screen=False
            ) as screen:
                while True:
                    time.sleep(0.25)
                    screen.update(views.countdown_view(name, month, day, year))
        except KeyboardInterrupt:
            pass
    else:
        console.print(views.countdown_view(name, month, day, year, now))

    _share(url, f"⏳ Counting down to {name}'s birthday!", show_qr, qr_style, links, qr_file, open_it)
    if ics:
        ics.write_text(birthday_ics(name, month, day, now, url), encoding="utf-8", newline="")
        _done(f"Calendar reminder saved to {ics}")
    if poster:
        cd_days = get_countdown(month, day, year, now).total_days
        render_poster(
            poster,
            theme=design,
            eyebrow="Birthday countdown",
            title=f"{name}'s birthday",
            body=f"{cd_days} days to go until {MONTHS[month - 1]} {day}. Scan the code to watch the clock tick.",
            url=url,
        )
        _done(f"Poster saved to {poster}")


@app.command()
def wish(
    to: Annotated[str, typer.Option("--to", "-t", help="The birthday person's name.")] = "",
    sender: Annotated[str, typer.Option("--from", "-f", help="Your name, signed under the wish.")] = "",
    recipient: Annotated[
        str,
        typer.Option(
            "--for",
            help="Who they are to you, see `bday list recipients`.",
            callback=_choice([r.id for r in wl.recipients()], "recipient"),
        ),
    ] = "anyone",
    mood: Annotated[
        str,
        typer.Option(
            "--mood",
            "-m",
            help="all, heartfelt, funny, short or inspirational.",
            callback=_choice(["all", *[t for t, _ in wl.tones()]], "mood"),
        ),
    ] = "all",
    design: Design = "confetti",
    pick: Annotated[
        Optional[int],
        typer.Option("--pick", "-p", help="Use message number N from --list instead of a random one.", min=1),
    ] = None,
    message: Annotated[str, typer.Option("--message", help="Write your own message instead.")] = "",
    search: Annotated[str, typer.Option("--search", "-s", help="Only messages containing this text.")] = "",
    list_all: Annotated[bool, typer.Option("--list", help="List the matching messages and exit.")] = False,
    show_qr: ShowQr = True,
    qr_style: Style = QrStyle.compact,
    links: Links = False,
    poster: Poster = None,
    qr_file: QrFile = None,
    open_it: Open = False,
) -> None:
    """Pick a birthday wish from 216 hand written messages and share it as a card."""
    found = wl.filter_messages(recipient, mood, search)
    if list_all:
        rows = [(i, m.tone, wl.personalize(m.text, to, recipient)) for i, m in enumerate(found, 1)]
        console.print(views.wish_list_view(rows))
        console.print(f"[dim]{len(found)} messages. Use --pick N to choose one.[/]")
        return

    if message.strip():
        text = message.strip()
    else:
        if not found:
            _fail("No messages match. Try a different --mood or --search.")
        if pick and pick > len(found):
            _fail(f"There are only {len(found)} matching messages, run with --list to see them.")
        chosen = found[pick - 1] if pick else random.choice(found)
        text = wl.personalize(chosen.text, to, recipient)

    console.print(views.wish_view(text, to, sender, design))
    url = wish_url(to, sender, design, text)
    _share(url, "🎂 A birthday wish for you", show_qr, qr_style, links, qr_file, open_it)
    if poster:
        render_poster(
            poster,
            theme=design,
            eyebrow="A birthday wish",
            title=f"Happy birthday, {to}!" if to.strip() else "Happy birthday!",
            body=text,
            footer=f"With love, {sender}" if sender.strip() else "",
            url=url,
        )
        _done(f"Poster saved to {poster}")


def _load_invite(path: Path) -> inv.Invite:
    """Reads an invite saved with --save, or a Party Mode data file."""
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as err:
        _fail(f"Could not read {path}: {err}")
    return inv.clean_invite(raw.get("invite", raw) if isinstance(raw, dict) else None)


def _invite_from_link(link: str) -> inv.Invite:
    """Pulls the packed invitation out of a web app link."""
    fragment = urlsplit(link.strip()).fragment
    query = parse_qs(fragment.split("?", 1)[1]) if "?" in fragment else {}
    data = decode_data(query.get("p", [""])[0])
    if not fragment.startswith("/invitation") or not isinstance(data, dict):
        _fail("That is not an invitation link from Birthday Studio.")
    return inv.clean_invite(data)


@app.command()
def invite(
    name: Annotated[str, typer.Option("--name", "-n", help="Whose party it is.")] = "",
    age: Annotated[str, typer.Option("--age", "-a", help="The age they are turning.")] = "",
    date: Annotated[str, typer.Option("--date", help="Party date as YYYY-MM-DD.")] = "",
    start: Annotated[str, typer.Option("--time", help="Start time as HH:MM, 24 hour.")] = "",
    end: Annotated[str, typer.Option("--end", help="End time as HH:MM.")] = "",
    venue: Annotated[str, typer.Option("--venue", help="Where it is.")] = "",
    address: Annotated[str, typer.Option("--address", help="Street address, used for the map link.")] = "",
    host: Annotated[str, typer.Option("--host", help="Who guests RSVP to.")] = "",
    rsvp: Annotated[str, typer.Option("--rsvp", help="Phone number or email for replies.")] = "",
    rsvp_by: Annotated[str, typer.Option("--rsvp-by", help="Reply deadline as YYYY-MM-DD.")] = "",
    dress: Annotated[str, typer.Option("--dress", help="Dress code.")] = "",
    note: Annotated[str, typer.Option("--note", help="Anything else guests should know.")] = "",
    headline: Annotated[str, typer.Option("--headline", help="The line above the title.")] = "",
    design: Annotated[
        Optional[str],
        typer.Option(
            "--design", "-d", help="Card design, see `bday list designs`.", callback=_choice(THEME_IDS, "design")
        ),
    ] = None,
    accent: Annotated[str, typer.Option("--accent", help="Accent colour as #rrggbb.")] = "",
    font: Annotated[
        str,
        typer.Option("--font", help="classic, elegant, playful or bold.", callback=_choice(["", *inv.FONTS], "font")),
    ] = "",
    example: Annotated[
        bool, typer.Option("--example", help="Start from the example party, your options override it.")
    ] = False,
    load: Annotated[
        Optional[Path],
        typer.Option("--load", help="Start from an invitation saved with --save.", exists=True, dir_okay=False),
    ] = None,
    from_link: Annotated[
        str, typer.Option("--from-link", help="Start from an invitation link made in the web app.")
    ] = "",
    save: Annotated[
        Optional[Path],
        typer.Option("--save", help="Save the invitation as JSON for later or for Party Mode.", dir_okay=False),
    ] = None,
    ics: Annotated[Optional[Path], typer.Option("--ics", help="Save a calendar event (.ics).", dir_okay=False)] = None,
    party_mode: Annotated[
        bool, typer.Option("--party", help="Go straight into Party Mode with this invitation.")
    ] = False,
    show_qr: ShowQr = True,
    qr_style: Style = QrStyle.compact,
    links: Links = False,
    poster: Poster = None,
    qr_file: QrFile = None,
    open_it: Open = False,
) -> None:
    """Make a party invitation guests can open, RSVP to and add to their calendar."""
    if load:
        base = _load_invite(load)
    elif from_link:
        base = _invite_from_link(from_link)
    elif example:
        base = inv.sample_invite()
    else:
        base = inv.Invite()

    given = {
        "name": name, "age": age, "date": date, "time": start, "endTime": end, "venue": venue, "address": address,
        "host": host, "rsvp": rsvp, "rsvpBy": rsvp_by, "dress": dress, "note": note, "headline": headline,
        "theme": design or "", "accent": accent, "font": font,
    }  # fmt: skip
    data = {**base.to_dict(), **{k: v for k, v in given.items() if v}}
    invitation = inv.clean_invite(data)
    if accent and invitation.accent != accent:
        _fail(f"The accent '{accent}' should look like #ff5d73")
    problems = inv.validate(invitation)
    if problems:
        _fail("\n  ".join(problems))
    if not invitation.name.strip() and not invitation.date:
        _fail("Add at least --name or --date, or start from --example")

    url = invite_url(invitation)
    console.print(views.invite_view(invitation))
    if party_mode:
        _run_party(invitation)
        return

    _share(url, inv.invite_text(invitation), show_qr, qr_style, links, qr_file, open_it)
    phone = inv.phone_digits(invitation.rsvp)
    if phone:
        console.print(f"[dim]Guests can reply on WhatsApp at[/] https://wa.me/{phone}")
    if save:
        save.write_text(json.dumps(invitation.to_dict(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        _done(f"Invitation saved to {save}. Start Party Mode with: bday party {save}")
    if ics:
        if not invitation.date:
            _fail("Add a --date to save a calendar event")
        ics.write_text(inv.invite_ics(invitation, url), encoding="utf-8", newline="")
        _done(f"Calendar event saved to {ics}")
    if poster:
        details = "\n".join(
            filter(
                None,
                [
                    inv.fmt_date(invitation.date),
                    inv.time_range(invitation),
                    inv.place_line(invitation),
                    inv.rsvp_line(invitation),
                ],
            )
        )
        render_poster(
            poster,
            theme=invitation.theme,
            eyebrow=invitation.headline or "You're invited",
            title=inv.party_title(invitation),
            body=details,
            url=url,
        )
        _done(f"Poster saved to {poster}")


def _run_party(
    invitation: inv.Invite,
    port: int = 8737,
    bind: str = "0.0.0.0",
    public_host: Optional[str] = None,
    fresh: bool = False,
    data: Optional[Path] = None,
    qr_style: QrStyle = QrStyle.compact,
    poster: Optional[Path] = None,
) -> None:
    from .share.party import Party, PartyServer

    party = Party.open(invitation, data, fresh)
    try:
        server = PartyServer(party, bind, port, public_host).start()
    except OSError as err:
        _fail(f"Could not listen on port {port} ({err.strerror or err}). Try another one with --port.")
    party.save()

    if poster:
        render_poster(
            poster,
            theme=invitation.theme,
            eyebrow="Scan to RSVP",
            title=inv.party_title(invitation),
            body="\n".join(
                filter(None, [inv.fmt_date(invitation.date), inv.time_range(invitation), inv.place_line(invitation)])
            ),
            footer="Connect to the party Wi-Fi first",
            url=server.url,
        )
        _done(f"Party poster saved to {poster}")
    if server.public_host.startswith("127."):
        console.print(
            "[yellow]![/] No network found, so only this computer can open the page. Connect to Wi-Fi and restart."
        )

    def dashboard():
        return views.party_view(party, server.url, server.wall_url, qr_style.value, console.width)

    if not console.is_terminal:
        # Output is going to a file or pipe, where the live dashboard only appears at the end
        console.print(Text(f"Party Mode is live at {server.url} (wish wall: {server.wall_url})"))

    seen = -1
    try:
        with Live(dashboard(), console=console, refresh_per_second=4, screen=console.is_terminal) as screen:
            while True:
                time.sleep(0.3)
                if party.version != seen:
                    seen = party.version
                    screen.update(dashboard())
    except KeyboardInterrupt:
        pass
    finally:
        server.stop()

    counts = party.counts()
    console.print(banner(tagline=False))
    _done(f"Party Mode stopped. {counts['yes']} coming, {counts['maybe']} maybe, {len(party.wishes)} wishes.")
    console.print(
        f"[dim]Everything is saved in {party.path}. Run the same command again to pick up where you left off.[/]"
    )


@app.command()
def party(
    source: Annotated[
        Optional[Path],
        typer.Argument(help="An invitation saved with `bday invite --save`.", exists=True, dir_okay=False),
    ] = None,
    from_link: Annotated[str, typer.Option("--from-link", help="Use an invitation link made in the web app.")] = "",
    example: Annotated[bool, typer.Option("--example", help="Try it with the example party.")] = False,
    port: Annotated[int, typer.Option("--port", help="Port to listen on.", min=1, max=65535)] = 8737,
    bind: Annotated[
        str, typer.Option("--bind", help="Address to listen on. 127.0.0.1 keeps it on this computer.")
    ] = "0.0.0.0",
    public_host: Annotated[
        Optional[str],
        typer.Option("--public-host", help="Address to put in the QR code, if the detected one is wrong."),
    ] = None,
    fresh: Annotated[bool, typer.Option("--fresh", help="Start over with a new link and no replies.")] = False,
    data: Annotated[
        Optional[Path], typer.Option("--data", help="Where to keep RSVPs and wishes (JSON).", dir_okay=False)
    ] = None,
    qr_style: Style = QrStyle.compact,
    poster: Annotated[
        Optional[Path],
        typer.Option("--poster", help="Save a printable poster whose QR code opens the party page.", dir_okay=False),
    ] = None,
) -> None:
    """Serve the invitation on your Wi-Fi. Guests scan, RSVP and leave wishes, live in your terminal."""
    if source:
        invitation = _load_invite(source)
    elif from_link:
        invitation = _invite_from_link(from_link)
    elif example:
        invitation = inv.sample_invite()
    else:
        _fail("Give Party Mode an invitation: a file from `bday invite --save`, --from-link or --example")
    _run_party(invitation, port, bind, public_host, fresh, data, qr_style, poster)


@app.command()
def share(
    url: Annotated[str, typer.Argument(help="Any link, usually one from the web app.")],
    text: Annotated[str, typer.Option("--text", help="Message to send with the link.")] = "🎉 Open this!",
    qr_style: Style = QrStyle.compact,
    links: Annotated[bool, typer.Option("--links/--no-links", help="Print share links for the big networks.")] = True,
    qr_file: QrFile = None,
) -> None:
    """Turn any link into a QR code and share links."""
    if not url.strip():
        _fail("Give a link to share")
    _share(url.strip(), text, True, qr_style, links, qr_file, False)


class Catalogue(str, Enum):
    designs = "designs"
    recipients = "recipients"
    moods = "moods"


@app.command("list")
def list_(what: Annotated[Catalogue, typer.Argument(help="designs, recipients or moods.")] = Catalogue.designs) -> None:
    """Show the card designs, recipients or moods you can pick from."""
    table = Table(box=None, header_style="bold", padding=(0, 2))
    if what is Catalogue.designs:
        table.add_column("Id")
        table.add_column("Name")
        table.add_column("Colours")
        for th in THEMES:
            swatch = Text()
            for color in (*th.bg, th.accent):
                swatch.append("██", style=color)
            table.add_row(th.id, th.name, swatch)
    elif what is Catalogue.recipients:
        table.add_column("Id")
        table.add_column("Who")
        table.add_column("Messages", justify="right")
        for r in wl.recipients():
            table.add_row(r.id, r.label, str(len(wl.filter_messages(r.id))))
    else:
        table.add_column("Id")
        table.add_column("Mood")
        table.add_column("Messages", justify="right")
        for tone_id, label in wl.tones():
            table.add_row(tone_id, label, str(sum(1 for m in wl.messages() if m.tone == tone_id)))
    console.print(table)


def main() -> None:
    # Old Windows consoles and pipes default to a code page without box characters
    for stream in (sys.stdout, sys.stderr):
        if stream and (stream.encoding or "").lower().replace("-", "") != "utf8" and hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    app()


if __name__ == "__main__":
    main()
