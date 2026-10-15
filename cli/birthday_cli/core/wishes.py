"""The wish library, a copy of src/tools/wishes/messages.js kept in data/wishes.json."""

from __future__ import annotations

import json
import random
import re
from dataclasses import dataclass
from functools import cache
from importlib import resources


@dataclass(frozen=True)
class Message:
    id: str
    to: str
    tone: str
    text: str


@dataclass(frozen=True)
class Recipient:
    id: str
    label: str
    fallback: str


@cache
def _library() -> dict:
    return json.loads(
        resources.files("birthday_cli").joinpath("data").joinpath("wishes.json").read_text(encoding="utf-8")
    )


def recipients() -> list[Recipient]:
    return [Recipient(**r) for r in _library()["recipients"]]


def tones() -> list[tuple[str, str]]:
    return [(t["id"], t["label"]) for t in _library()["tones"]]


def messages() -> list[Message]:
    return [Message(**m) for m in _library()["messages"]]


def get_recipient(recipient_id: str) -> Recipient:
    found = recipients()
    return next((r for r in found if r.id == recipient_id), found[0])


def filter_messages(to: str = "anyone", tone: str = "all", query: str = "") -> list[Message]:
    """Messages for a recipient plus the universal ones, the recipient's own first."""
    q = query.strip().lower()
    found = [
        m
        for m in messages()
        if m.to in (to, "anyone") and (tone == "all" or m.tone == tone) and (not q or q in m.text.lower())
    ]
    return sorted(found, key=lambda m: 0 if m.to == to else 1)


def personalize(text: str, name: str, recipient_id: str = "anyone") -> str:
    """Fills in the name, or removes the placeholder gracefully when there is none."""
    who = name.strip() or get_recipient(recipient_id).fallback
    if who:
        out = text.replace("{name}", who)
    else:
        out = re.sub(r",\s*\{name\}", "", text)
        out = re.sub(r"\{name\},\s*", "", out)
        out = out.replace("{name}", "you")
    return re.sub(r"(^|[.!?]\s+)([a-z])", lambda m: m.group(1) + m.group(2).upper(), out)


def pick(to: str = "anyone", tone: str = "all", rng: random.Random | None = None) -> Message:
    return (rng or random).choice(filter_messages(to, tone))
