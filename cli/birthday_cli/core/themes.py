"""Card designs, mirrored from src/lib/canvas/themes.js so ids match the web app."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Theme:
    id: str
    name: str
    bg: tuple[str, ...]
    ink: str
    sub: str
    accent: str
    dark: bool = False


THEMES: list[Theme] = [
    Theme("confetti", "Confetti Pop", ("#fff3e4", "#ffe0ea"), "#2b1640", "#6e5480", "#ff4d6d"),
    Theme("golden", "Golden Night", ("#2a1e5c", "#0b0d26"), "#fff6e0", "#d9cba3", "#f2c46d", dark=True),
    Theme("pastel", "Pastel Dream", ("#eadfff", "#fbe7f3", "#ffe4d9"), "#3a2a5a", "#7a6a99", "#8b5cf6"),
    Theme("balloons", "Balloon Sky", ("#bee7ff", "#fff0fa"), "#1d2856", "#4a5585", "#ff5d73"),
    Theme("sunset", "Sunset Glow", ("#ff9a5a", "#f2507a", "#6b3fd6"), "#ffffff", "#fbe3e8", "#ffe58a", dark=True),
    Theme("floral", "Garden Bloom", ("#fff8f0", "#fdeee8"), "#2e3a2c", "#6b7466", "#e0607e"),
    Theme("neon", "Neon Party", ("#0b0a1a", "#1a0b2e"), "#ffffff", "#c9c2f0", "#ff3dcb", dark=True),
    Theme("minimal", "Simple Ink", ("#faf6f0",), "#1e1b1a", "#6d655f", "#e2583e"),
    Theme("kids", "Party Time", ("#fff4cf",), "#2d1b4e", "#5c4a7a", "#ff7a1a"),
    Theme("love", "Sweetheart", ("#fff0f3", "#ffd0dc"), "#4a1027", "#8c4a62", "#e63462"),
]

THEME_IDS = [t.id for t in THEMES]


def get_theme(theme_id: str | None) -> Theme:
    """Unknown ids fall back to the first design, like getTheme() in the web app."""
    return next((t for t in THEMES if t.id == theme_id), THEMES[0])
