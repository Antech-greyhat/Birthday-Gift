"""The wordmark and the big countdown digits, drawn with box characters."""

from __future__ import annotations

from rich.text import Text

from . import __version__

# The web app's brand colours: coral, sun, mint, sky, lilac
PALETTE = ["#ff5d73", "#ffb938", "#19c2a0", "#4f7cff", "#a77bff"]

LETTERS = {
    "B": ("╔╗ ", "╠╩╗", "╚═╝"),
    "I": ("╦", "║", "╩"),
    "R": ("╦═╗", "╠╦╝", "╩╚═"),
    "T": ("╔╦╗", " ║ ", " ╩ "),
    "H": ("╦ ╦", "╠═╣", "╩ ╩"),
    "D": ("╔╦╗", " ║║", "═╩╝"),
    "A": ("╔═╗", "╠═╣", "╩ ╩"),
    "Y": ("╦ ╦", "╚╦╝", " ╩ "),
    "S": ("╔═╗", "╚═╗", "╚═╝"),
    "U": ("╦ ╦", "║ ║", "╚═╝"),
    "O": ("╔═╗", "║ ║", "╚═╝"),
    " ": ("  ", "  ", "  "),
}

DIGITS = {
    "0": ("╔═╗", "║ ║", "╚═╝"),
    "1": (" ╗ ", " ║ ", " ╩ "),
    "2": ("╔═╗", "╔═╝", "╚═╝"),
    "3": ("╔═╗", " ═╣", "╚═╝"),
    "4": ("╦ ╦", "╚═╣", "  ╩"),
    "5": ("╔═╗", "╚═╗", "╚═╝"),
    "6": ("╔═╗", "╠═╗", "╚═╝"),
    "7": ("╔═╗", "  ║", "  ╩"),
    "8": ("╔═╗", "╠═╣", "╚═╝"),
    "9": ("╔═╗", "╚═╣", "╚═╝"),
    ":": ("   ", " ● ", " ● "),
    " ": ("  ", "  ", "  "),
}


def _draw(word: str, font: dict, colors: list[str]) -> Text:
    text = Text(no_wrap=True)
    glyphs = [font[ch] for ch in word]
    for row in range(3):
        color_index = 0
        for ch, glyph in zip(word, glyphs):
            style = f"bold {colors[color_index % len(colors)]}"
            text.append(glyph[row] + " ", style=style)
            if ch != " ":
                color_index += 1
        text.append("\n")
    return text


def banner(tagline: bool = True) -> Text:
    text = Text(no_wrap=True)
    text.append("\n")
    text.append_text(_draw("BIRTHDAY STUDIO", LETTERS, PALETTE))
    if tagline:
        text.append("  countdowns · wishes · invitations · party mode", style="dim")
        text.append(f"   v{__version__}\n", style="dim italic")
    return text


def big_digits(value: str, color: str = PALETTE[0]) -> Text:
    """Large three line digits for the countdown clock."""
    return _draw(value, DIGITS, [color])
