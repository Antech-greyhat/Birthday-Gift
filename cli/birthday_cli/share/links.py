"""Builds the same shareable links as src/lib/url.js, so the live site opens them."""

from __future__ import annotations

import base64
import json
import os
from urllib.parse import quote, urlencode

from ..core.invitation import Invite

DEFAULT_BASE_URL = "https://birthday-gift-wish.vercel.app/"


def base_url() -> str:
    """The deployed site, overridable with BDAY_BASE_URL for forks and local builds."""
    url = os.environ.get("BDAY_BASE_URL", "").strip() or DEFAULT_BASE_URL
    return url.split("#")[0]


def encode_data(obj: object) -> str:
    """Byte for byte the same as encodeData() in the web app."""
    raw = json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def decode_data(text: str) -> object | None:
    try:
        padded = text + "=" * (-len(text) % 4)
        return json.loads(base64.urlsafe_b64decode(padded.encode("ascii")).decode("utf-8"))
    except (ValueError, UnicodeError):
        return None


def build_url(path: str, params: dict[str, object] | None = None) -> str:
    kept = {k: v for k, v in (params or {}).items() if v not in ("", None)}
    search = urlencode(kept)
    return f"{base_url()}#{path}{'?' + search if search else ''}"


def countdown_url(name: str, month: int, day: int, year: int | None = None, theme: str = "golden") -> str:
    return build_url(
        "/countdown", {"n": name, "m": month, "d": day, "y": year, "t": "" if theme == "golden" else theme}
    )


def wish_url(name: str, sender: str, design: str, message: str) -> str:
    return build_url("/wishes", {"view": 1, "n": name.strip(), "f": sender.strip(), "d": design, "m": message})


def invite_url(invite: Invite) -> str:
    # Empty fields are dropped to keep the QR code small, the site fills them back in
    packed = {k: v for k, v in invite.to_dict().items() if v}
    return build_url("/invitation", {"view": 1, "p": encode_data(packed)})


def share_links(text: str, url: str, title: str = "Birthday Studio") -> dict[str, str]:
    """Link based share intents, the same networks the web share sheet opens."""

    def enc(value: str) -> str:
        return quote(value, safe="")

    message = enc(f"{text}\n{url}")
    email = enc(f"{text}\n\n{url}")
    return {
        "WhatsApp": f"https://wa.me/?text={message}",
        "Telegram": f"https://t.me/share/url?url={enc(url)}&text={enc(text)}",
        "X": f"https://x.com/intent/post?text={enc(text)}&url={enc(url)}",
        "Facebook": f"https://www.facebook.com/sharer/sharer.php?u={enc(url)}&quote={enc(text)}",
        "Email": f"mailto:?subject={enc(title)}&body={email}",
    }
