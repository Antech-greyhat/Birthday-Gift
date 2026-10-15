"""The full screen app that opens when you run `bday` on its own."""

from __future__ import annotations

import json
import random
import re
import webbrowser
from datetime import datetime
from pathlib import Path

from rich.console import Group
from rich.text import Text
from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.screen import Screen
from textual.widgets import Button, Footer, Input, Label, Select, Static

from .. import views
from ..banner import banner
from ..core import invitation as inv
from ..core import wishes as wl
from ..core.countdown import MONTHS, birthday_ics, birthday_in, get_countdown, parse_month_day
from ..core.themes import THEMES
from ..render.poster import render_poster
from ..share.links import countdown_url, invite_url, wish_url

DESIGNS = [(t.name, t.id) for t in THEMES]


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:40] or "birthday"


def _error(message: str) -> Text:
    return Text(message, style="italic #ff5d73")


class ToolScreen(Screen):
    """A form on the left and a live preview with its QR code on the right."""

    BINDINGS = [
        Binding("escape", "app.pop_screen", "Back"),
        Binding("ctrl+o", "open_link", "Open in browser"),
        Binding("ctrl+s", "save_poster", "Save poster"),
    ]
    url: str = ""

    def preview(self) -> None:
        raise NotImplementedError

    def on_mount(self) -> None:
        self.preview()

    def on_input_changed(self) -> None:
        self.preview()

    def on_select_changed(self) -> None:
        self.preview()

    def show(self, *parts) -> None:
        self.query_one("#preview", Static).update(Group(*parts))

    def action_open_link(self) -> None:
        if self.url:
            webbrowser.open(self.url)
            self.notify("Opened in your browser")

    def action_save_poster(self) -> None:
        if self.url:
            path = self.save_poster()
            self.notify(f"Poster saved to {path}")

    def save_poster(self) -> Path:
        raise NotImplementedError

    def on_button_pressed(self, event: Button.Pressed) -> None:
        action = getattr(self, f"action_{event.button.id.replace('-', '_')}", None)
        if action:
            action()


class CountdownScreen(ToolScreen):
    def compose(self) -> ComposeResult:
        with Horizontal():
            with VerticalScroll(classes="form"):
                yield Label("Birthday Countdown", classes="title")
                yield Label("Name")
                yield Input(placeholder="Ava", id="name")
                yield Label("Birthday (MM-DD)")
                yield Input(placeholder="05-14", id="when")
                yield Label("Birth year (optional)")
                yield Input(placeholder="1998", id="year", restrict=r"\d{0,4}")
                yield Label("Design")
                yield Select(DESIGNS, value="golden", allow_blank=False, id="design")
                yield Button("Save poster", id="save-poster", variant="primary")
                yield Button("Save calendar reminder", id="save-ics")
                yield Button("Open in browser", id="open-link")
            yield VerticalScroll(Static(id="preview"), classes="preview")
        yield Footer()

    def on_mount(self) -> None:
        super().on_mount()
        self.set_interval(1, self.preview)

    def values(self):
        name = self.query_one("#name", Input).value.strip()
        month, day = parse_month_day(self.query_one("#when", Input).value.strip())
        raw_year = self.query_one("#year", Input).value
        year = int(raw_year) if len(raw_year) == 4 else None
        if year is not None and not (1900 <= year and birthday_in(year, month, day) <= datetime.now().date()):
            raise ValueError(
                f"{MONTHS[month - 1]} {day}, {year} hasn't happened yet"
                if year >= 1900
                else "Enter a year from 1900 on"
            )
        if not name:
            raise ValueError("Add their name to start the clock.")
        return name, month, day, year

    def preview(self) -> None:
        try:
            name, month, day, year = self.values()
        except ValueError as err:
            self.url = ""
            return self.show(
                _error(
                    str(err) if self.query_one("#when", Input).value else "Enter a name and a birthday such as 05-14."
                )
            )
        self.url = countdown_url(name, month, day, year, self.query_one("#design", Select).value)
        self.show(views.countdown_view(name, month, day, year), views.share_view(self.url))

    def save_poster(self) -> Path:
        name, month, day, year = self.values()
        days = get_countdown(month, day, year, datetime.now()).total_days
        return render_poster(
            Path(f"{_slug(name)}-countdown.png"),
            theme=self.query_one("#design", Select).value,
            eyebrow="Birthday countdown",
            title=f"{name}'s birthday",
            body=f"{days} days to go until {MONTHS[month - 1]} {day}. Scan the code to watch the clock tick.",
            url=self.url,
        )

    def action_save_ics(self) -> None:
        if self.url:
            name, month, day, _ = self.values()
            path = Path(f"{_slug(name)}-birthday.ics")
            path.write_text(birthday_ics(name, month, day, datetime.now(), self.url), encoding="utf-8", newline="")
            self.notify(f"Calendar reminder saved to {path}")


class WishScreen(ToolScreen):
    BINDINGS = [Binding("ctrl+r", "shuffle", "Shuffle")]

    def __init__(self) -> None:
        super().__init__()
        self.index = 0
        self.text = ""

    def compose(self) -> ComposeResult:
        with Horizontal():
            with VerticalScroll(classes="form"):
                yield Label("Birthday Wishes", classes="title")
                yield Label("Their name")
                yield Input(placeholder="Ava", id="to")
                yield Label("From")
                yield Input(placeholder="Sam", id="sender")
                yield Label("Who they are to you")
                yield Select(
                    [(r.label, r.id) for r in wl.recipients()], value="anyone", allow_blank=False, id="recipient"
                )
                yield Label("Mood")
                yield Select(
                    [("All", "all"), *[(label, tid) for tid, label in wl.tones()]],
                    value="all",
                    allow_blank=False,
                    id="mood",
                )
                yield Label("Design")
                yield Select(DESIGNS, value="confetti", allow_blank=False, id="design")
                with Horizontal(classes="row"):
                    yield Button("◀ Prev", id="prev")
                    yield Button("Shuffle", id="shuffle", variant="primary")
                    yield Button("Next ▶", id="next")
                yield Button("Save poster", id="save-poster")
                yield Button("Open in browser", id="open-link")
            yield VerticalScroll(Static(id="preview"), classes="preview")
        yield Footer()

    def found(self) -> list[wl.Message]:
        return wl.filter_messages(self.query_one("#recipient", Select).value, self.query_one("#mood", Select).value)

    def on_select_changed(self) -> None:
        self.index = 0
        self.preview()

    def action_prev(self) -> None:
        self.index -= 1
        self.preview()

    def action_next(self) -> None:
        self.index += 1
        self.preview()

    def action_shuffle(self) -> None:
        self.index = random.randrange(max(1, len(self.found())))
        self.preview()

    def preview(self) -> None:
        found = self.found()
        if not found:
            self.url = ""
            return self.show(_error("No messages for that mix, try another mood."))
        self.index %= len(found)
        to = self.query_one("#to", Input).value
        sender = self.query_one("#sender", Input).value
        design = self.query_one("#design", Select).value
        self.text = wl.personalize(found[self.index].text, to, self.query_one("#recipient", Select).value)
        self.url = wish_url(to, sender, design, self.text)
        counter = Text(f"Message {self.index + 1} of {len(found)}", style="dim")
        self.show(
            views.wish_view(self.text, to.strip(), sender.strip(), design), counter, Text(), views.share_view(self.url)
        )

    def save_poster(self) -> Path:
        to = self.query_one("#to", Input).value.strip()
        sender = self.query_one("#sender", Input).value.strip()
        return render_poster(
            Path(f"{_slug(to or 'birthday')}-wish.png"),
            theme=self.query_one("#design", Select).value,
            eyebrow="A birthday wish",
            title=f"Happy birthday, {to}!" if to else "Happy birthday!",
            body=self.text,
            footer=f"With love, {sender}" if sender else "",
            url=self.url,
        )


INVITE_FIELDS = [
    ("name", "Whose party", "Ava"),
    ("age", "Turning", "7"),
    ("date", "Date (YYYY-MM-DD)", "2026-11-02"),
    ("time", "Starts (HH:MM)", "16:00"),
    ("endTime", "Ends (HH:MM)", "19:00"),
    ("venue", "Venue", "Sunny Park Pavilion"),
    ("address", "Address", "123 Garden Lane"),
    ("host", "RSVP to", "Emma & James"),
    ("rsvp", "Phone or email", "+1 555 012 3456"),
    ("rsvpBy", "Reply by (YYYY-MM-DD)", ""),
    ("dress", "Dress code", ""),
    ("note", "Good to know", ""),
]


class InviteScreen(ToolScreen):
    BINDINGS = [Binding("ctrl+l", "example", "Load example"), Binding("ctrl+t", "party", "Party Mode")]

    def compose(self) -> ComposeResult:
        with Horizontal():
            with VerticalScroll(classes="form"):
                yield Label("Invitation Maker", classes="title")
                for key, label, hint in INVITE_FIELDS:
                    yield Label(label)
                    yield Input(placeholder=hint, id=f"f-{key}")
                yield Label("Design")
                yield Select(DESIGNS, value="balloons", allow_blank=False, id="design")
                yield Button("Start Party Mode", id="party", variant="primary")
                yield Button("Load example", id="example")
                yield Button("Save poster", id="save-poster")
                yield Button("Save for later (JSON)", id="save-json")
                yield Button("Open in browser", id="open-link")
            yield VerticalScroll(Static(id="preview"), classes="preview")
        yield Footer()

    def invite(self) -> inv.Invite:
        data = {key: self.query_one(f"#f-{key}", Input).value for key, _, _ in INVITE_FIELDS}
        data["theme"] = self.query_one("#design", Select).value
        data["headline"] = "You're invited"
        return inv.clean_invite(data)

    def preview(self) -> None:
        invite = self.invite()
        problems = inv.validate(invite)
        if problems or not (invite.name.strip() or invite.date):
            self.url = ""
            return self.show(
                _error("\n".join(problems) or "Fill in the party details, or press Ctrl+L for an example.")
            )
        self.url = invite_url(invite)
        self.show(views.invite_view(invite), views.share_view(self.url))

    def action_example(self) -> None:
        sample = inv.sample_invite().to_dict()
        with self.prevent(Input.Changed, Select.Changed):
            for key, _, _ in INVITE_FIELDS:
                self.query_one(f"#f-{key}", Input).value = sample[key]
            self.query_one("#design", Select).value = sample["theme"]
        self.preview()

    def save_poster(self) -> Path:
        invite = self.invite()
        details = "\n".join(
            filter(
                None, [inv.fmt_date(invite.date), inv.time_range(invite), inv.place_line(invite), inv.rsvp_line(invite)]
            )
        )
        return render_poster(
            Path(f"{_slug(inv.party_title(invite))}.png"),
            theme=invite.theme,
            eyebrow="You're invited",
            title=inv.party_title(invite),
            body=details,
            url=self.url,
        )

    def action_save_json(self) -> None:
        if self.url:
            path = Path(f"{_slug(inv.party_title(self.invite()))}.json")
            path.write_text(json.dumps(self.invite().to_dict(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            self.notify(f"Saved to {path}. Run `bday party {path}` any time.")

    def action_party(self) -> None:
        if self.url:
            self.app.push_screen(PartyScreen(self.invite()))
        else:
            self.notify("Fill in the party details first", severity="warning")


class PartyScreen(Screen):
    BINDINGS = [Binding("escape", "stop", "Stop Party Mode"), Binding("ctrl+o", "open_wall", "Open wish wall")]

    def __init__(self, invite: inv.Invite) -> None:
        super().__init__()
        self.invite = invite
        self.server = None
        self.seen = -1

    def compose(self) -> ComposeResult:
        yield VerticalScroll(Static(id="dashboard"))
        yield Footer()

    def on_mount(self) -> None:
        from ..share.party import Party, PartyServer

        party = Party.open(self.invite)
        try:
            self.server = PartyServer(party).start()
        except OSError as err:
            self.notify(f"Could not start Party Mode: {err.strerror or err}", severity="error")
            self.app.pop_screen()
            return
        party.save()
        self.set_interval(0.5, self.refresh_dashboard)
        self.refresh_dashboard()

    def refresh_dashboard(self) -> None:
        party = self.server.party
        if party.version != self.seen:
            self.seen = party.version
            self.query_one("#dashboard", Static).update(
                views.party_view(
                    party, self.server.url, self.server.wall_url, width=self.size.width, stop_hint="Esc to stop"
                )
            )

    def on_resize(self) -> None:
        self.seen = -1

    def action_open_wall(self) -> None:
        if self.server:
            webbrowser.open(self.server.wall_url)

    def action_stop(self) -> None:
        self.app.pop_screen()

    def on_unmount(self) -> None:
        if self.server:
            self.server.stop()


class HomeScreen(Screen):
    BINDINGS = [
        Binding("c", "open('countdown')", "Countdown"),
        Binding("w", "open('wishes')", "Wishes"),
        Binding("i", "open('invitation')", "Invitation"),
        Binding("q", "app.quit", "Quit"),
    ]

    def compose(self) -> ComposeResult:
        with Vertical(id="home"):
            yield Static(banner(), id="banner")
            yield Button("⏳  Birthday Countdown   Live clock, star sign and fun facts", id="countdown", classes="tool")
            yield Button("💌  Birthday Wishes      216 hand written messages on a card", id="wishes", classes="tool")
            yield Button("🎉  Invitation Maker     RSVPs, calendar and Party Mode", id="invitation", classes="tool")
            yield Static(
                "Every card ends with a QR code: scan it with a phone to open the live, animated version.", id="hint"
            )
        yield Footer()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        self.action_open(event.button.id)

    def action_open(self, tool: str) -> None:
        screens = {"countdown": CountdownScreen, "wishes": WishScreen, "invitation": InviteScreen}
        self.app.push_screen(screens[tool]())


class BirthdayStudio(App):
    TITLE = "Birthday Studio"
    ENABLE_COMMAND_PALETTE = False
    CSS = """
    Screen { background: $background; }
    #home { align: center middle; height: 100%; }
    #banner { width: auto; height: auto; margin-bottom: 1; }
    #hint { color: $text-muted; width: 72; margin-top: 1; text-align: center; }
    .tool { width: 72; margin: 0 0 1 0; content-align: left middle; }
    .form { width: 38; min-width: 30; padding: 0 1; border-right: tall $panel; }
    .form Label { margin-top: 1; color: $text-muted; }
    .form .title { color: #ff5d73; text-style: bold; margin: 1 0 0 0; }
    .form Button { width: 100%; margin-top: 1; }
    .form .row { height: auto; }
    .form .row Button { width: 1fr; min-width: 0; margin-right: 1; }
    .preview { padding: 0 1; }
    """

    def on_mount(self) -> None:
        self.push_screen(HomeScreen())


def run() -> None:
    BirthdayStudio().run()
