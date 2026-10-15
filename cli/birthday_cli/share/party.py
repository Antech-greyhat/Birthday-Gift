"""Party Mode: serve an invitation on the local network and collect RSVPs and wishes.

Guests on the same Wi-Fi scan a QR code, open the invitation from this computer,
RSVP and leave a wish. Replies land in a JSON file and on the host's terminal.
No internet connection or outside service is involved.
"""

from __future__ import annotations

import html
import json
import re
import secrets
import socket
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from importlib import resources
from pathlib import Path
from string import Template
from urllib.parse import parse_qs, urlsplit

from ..core import invitation as inv
from ..core.themes import get_theme
from .links import invite_url

DEFAULT_PORT = 8737
MAX_BODY = 4096
MAX_RSVPS = 300
MAX_WISHES = 500
POST_COOLDOWN = 2.0
ANSWERS = {"yes": "Coming", "maybe": "Maybe", "no": "Can't make it"}

CSP = (
    "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; "
    "connect-src 'self'; img-src 'self' data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
)


def data_dir() -> Path:
    return Path.home() / ".birthday-studio" / "parties"


def lan_ip() -> str:
    """The address other devices on this network can reach, without sending any traffic."""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        try:
            s.connect(("10.255.255.255", 1))
            return s.getsockname()[0]
        except OSError:
            return "127.0.0.1"


def _clip(value: str, limit: int) -> str:
    return re.sub(r"\s+", " ", value).strip()[:limit]


@dataclass
class Rsvp:
    name: str
    answer: str
    guests: int
    note: str
    at: str


@dataclass
class Wish:
    name: str
    message: str
    at: str


@dataclass
class Party:
    """Everything the party knows, saved to disk after every change."""

    invite: inv.Invite
    token: str
    path: Path
    rsvps: list[Rsvp] = field(default_factory=list)
    wishes: list[Wish] = field(default_factory=list)
    log: list[str] = field(default_factory=list)
    version: int = 0
    lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    @classmethod
    def open(cls, invite: inv.Invite, path: Path | None = None, fresh: bool = False) -> Party:
        """Reuses the saved token and replies, so printed QR codes keep working after a restart."""
        slug = re.sub(r"[^a-z0-9]+", "-", inv.party_title(invite).lower()).strip("-")[:40] or "party"
        path = path or data_dir() / f"{slug}-{invite.date or 'undated'}.json"
        if path.exists() and not fresh:
            saved = json.loads(path.read_text(encoding="utf-8"))
            return cls(
                invite=invite,
                token=saved["token"],
                path=path,
                rsvps=[Rsvp(**r) for r in saved.get("rsvps", [])],
                wishes=[Wish(**w) for w in saved.get("wishes", [])],
            )
        return cls(invite=invite, token=secrets.token_urlsafe(6), path=path)

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "token": self.token,
            "invite": self.invite.to_dict(),
            "rsvps": [r.__dict__ for r in self.rsvps],
            "wishes": [w.__dict__ for w in self.wishes],
        }
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
        tmp.replace(self.path)

    def _changed(self, entry: str) -> None:
        self.log.append(f"{datetime.now():%H:%M:%S}  {entry}")
        del self.log[:-50]
        self.version += 1
        self.save()

    def add_rsvp(self, name: str, answer: str, guests: int, note: str) -> Rsvp | None:
        name, note = _clip(name, 60), _clip(note, 200)
        if not name or answer not in ANSWERS:
            return None
        guests = max(1, min(guests, 10)) if answer != "no" else 0
        rsvp = Rsvp(name, answer, guests, note, datetime.now().isoformat(timespec="seconds"))
        with self.lock:
            # A second reply from the same name replaces the first
            existing = [r for r in self.rsvps if r.name.lower() != name.lower()]
            if len(existing) >= MAX_RSVPS:
                return None
            self.rsvps = existing + [rsvp]
            self._changed(f"RSVP  {name}: {ANSWERS[answer]}" + (f" (+{guests - 1})" if guests > 1 else ""))
        return rsvp

    def add_wish(self, name: str, message: str) -> Wish | None:
        name, message = _clip(name, 60) or "A guest", _clip(message, 280)
        if not message:
            return None
        wish = Wish(name, message, datetime.now().isoformat(timespec="seconds"))
        with self.lock:
            if len(self.wishes) >= MAX_WISHES:
                return None
            self.wishes.append(wish)
            self._changed(f"Wish  {name}: {message[:50]}")
        return wish

    def counts(self) -> dict[str, int]:
        heads = {key: 0 for key in ANSWERS}
        for r in self.rsvps:
            heads[r.answer] += r.guests if r.answer != "no" else 1
        return heads

    def public_state(self) -> dict:
        """What the wish wall polls. RSVP notes stay private to the host."""
        return {
            "version": self.version,
            "counts": self.counts(),
            "wishes": [{"name": w.name, "message": w.message} for w in self.wishes[-60:]],
        }


def _template(name: str) -> Template:
    return Template(
        resources.files("birthday_cli")
        .joinpath("share")
        .joinpath("templates")
        .joinpath(name)
        .read_text(encoding="utf-8")
    )


def _theme_vars(invite: inv.Invite) -> dict[str, str]:
    th = get_theme(invite.theme)
    stops = th.bg if len(th.bg) > 1 else (th.bg[0], th.bg[0])
    return {
        "bg": f"linear-gradient(160deg, {', '.join(stops)})",
        "ink": th.ink,
        "sub": th.sub,
        "accent": invite.accent or th.accent,
        "panel": "rgba(255,255,255,0.10)" if th.dark else "rgba(255,255,255,0.72)",
        "field": "rgba(255,255,255,0.14)" if th.dark else "#ffffff",
        "button_ink": "#1e1b1a" if th.dark else "#ffffff",
    }


def render_invite_page(party: Party, notice: str = "") -> str:
    d = party.invite
    e = html.escape
    rows = [
        ("Date", inv.fmt_date(d.date)) if d.date else None,
        ("Time", inv.time_range(d)) if d.time else None,
        ("Place", inv.place_line(d)) if inv.place_line(d) else None,
        ("Dress code", d.dress) if d.dress.strip() else None,
        ("Good to know", d.note) if d.note.strip() else None,
        ("RSVP", inv.rsvp_line(d)) if inv.rsvp_line(d) else None,
    ]
    details = "".join(f"<div class=row><dt>{e(k)}</dt><dd>{e(v)}</dd></div>" for k, v in filter(None, rows))
    links = ['<a class=btn href="invite.ics" download>Add to calendar</a>'] if d.date else []
    if inv.place_line(d):
        links.append(f'<a class=btn href="{e(inv.maps_url(d))}" target=_blank rel=noreferrer>Open map</a>')
    links.append(
        f'<a class="btn ghost" href="{e(invite_url(d))}" target=_blank rel=noreferrer>Animated card (online)</a>'
    )
    notices = {
        "rsvp": "Thanks! Your RSVP is in.",
        "wish": "Your wish is on the wall.",
        "error": "That did not go through, please check the form and try again.",
        "slow": "One moment, please wait a couple of seconds and try again.",
    }
    return _template("invite.html").substitute(
        **_theme_vars(d),
        title=e(inv.party_title(d)),
        headline=e(d.headline.strip() or "You're invited"),
        details=details,
        links="".join(links),
        notice=f"<p class=notice role=status>{e(notices[notice])}</p>" if notice in notices else "",
    )


def render_wall_page(party: Party) -> str:
    return _template("wall.html").substitute(
        **_theme_vars(party.invite),
        title=html.escape(inv.party_title(party.invite)),
        # Escaping every "<" keeps guest text from ever opening or closing a tag in the script
        state=json.dumps(party.public_state()).replace("<", "\\u003c"),
    )


def make_handler(party: Party):
    last_post: dict[str, float] = {}
    prefix = f"/{party.token}"

    class Handler(BaseHTTPRequestHandler):
        server_version = "BirthdayStudio"
        sys_version = ""

        def log_message(self, *args) -> None:  # the dashboard shows activity instead
            pass

        def _send(
            self, status: int, body: str | bytes, ctype: str = "text/html; charset=utf-8", extra: dict | None = None
        ) -> None:
            data = body.encode("utf-8") if isinstance(body, str) else body
            self.send_response(status)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Referrer-Policy", "no-referrer")
            self.send_header("Content-Security-Policy", CSP)
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(data)

        def _route(self) -> tuple[str, dict[str, list[str]]] | None:
            url = urlsplit(self.path)
            if url.path != prefix and not url.path.startswith(prefix + "/"):
                return None
            return url.path[len(prefix) :] or "/", parse_qs(url.query)

        def _not_found(self) -> None:
            self._send(HTTPStatus.NOT_FOUND, "<!doctype html><title>Not found</title><p>Nothing here.</p>")

        def _redirect(self, where: str) -> None:
            self._send(HTTPStatus.SEE_OTHER, "", extra={"Location": f"{prefix}/{where}"})

        def do_HEAD(self) -> None:
            self.do_GET()

        def do_GET(self) -> None:
            routed = self._route()
            if not routed:
                return self._not_found()
            path, query = routed
            if path == "/":
                if not self.path.split("?")[0].endswith("/"):
                    return self._redirect("")
                return self._send(HTTPStatus.OK, render_invite_page(party, query.get("done", [""])[0]))
            if path == "/wall":
                return self._send(HTTPStatus.OK, render_wall_page(party))
            if path == "/api/state":
                return self._send(HTTPStatus.OK, json.dumps(party.public_state()), "application/json")
            if path == "/invite.ics" and party.invite.date:
                return self._send(
                    HTTPStatus.OK,
                    inv.invite_ics(party.invite),
                    "text/calendar; charset=utf-8",
                    {"Content-Disposition": 'attachment; filename="invitation.ics"'},
                )
            self._not_found()

        def do_POST(self) -> None:
            routed = self._route()
            if not routed or routed[0] not in ("/rsvp", "/wish"):
                return self._not_found()
            try:
                length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                length = -1
            if not 0 < length <= MAX_BODY:
                return self._send(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, "Too large")
            form = {k: v[0] for k, v in parse_qs(self.rfile.read(length).decode("utf-8", "replace")).items()}

            ip = self.client_address[0]
            now = time.monotonic()
            if now - last_post.get(ip, 0) < POST_COOLDOWN:
                return self._redirect("?done=slow")
            last_post[ip] = now

            if routed[0] == "/rsvp":
                try:
                    guests = int(form.get("guests", "1"))
                except ValueError:
                    guests = 1
                ok = party.add_rsvp(form.get("name", ""), form.get("answer", ""), guests, form.get("note", ""))
                return self._redirect("?done=rsvp#rsvp" if ok else "?done=error#rsvp")
            ok = party.add_wish(form.get("name", ""), form.get("message", ""))
            self._redirect("?done=wish#wish" if ok else "?done=error#wish")

    return Handler


class PartyServer:
    """Runs the web server on a background thread so the terminal stays free for the dashboard."""

    def __init__(self, party: Party, host: str = "0.0.0.0", port: int = DEFAULT_PORT, public_host: str | None = None):
        self.party = party
        self.httpd = ThreadingHTTPServer((host, port), make_handler(party))
        self.httpd.daemon_threads = True
        self.port = self.httpd.server_address[1]
        self.public_host = public_host or (lan_ip() if host in ("0.0.0.0", "") else host)
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)

    @property
    def url(self) -> str:
        return f"http://{self.public_host}:{self.port}/{self.party.token}/"

    @property
    def wall_url(self) -> str:
        return self.url + "wall"

    def start(self) -> PartyServer:
        self.thread.start()
        return self

    def stop(self) -> None:
        self.httpd.shutdown()
        self.httpd.server_close()
