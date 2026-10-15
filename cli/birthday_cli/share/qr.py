"""QR codes for the terminal and for files.

The terminal version always draws dark modules on a light background with
explicit colours, so it scans the same on light and dark terminal themes.
"""

from __future__ import annotations

from pathlib import Path

import segno
from PIL import Image
from rich.text import Text

BORDER = 2
STYLES = ("compact", "wide", "ascii")

# (top module dark, bottom module dark) -> character drawn in black on white
HALF_BLOCKS = {(True, True): "█", (True, False): "▀", (False, True): "▄", (False, False): " "}


def make(data: str) -> segno.QRCode:
    # Low error correction keeps long invitation links scannable from a screen
    return segno.make(data, error="l", micro=False, boost_error=False)


def _grid(qr: segno.QRCode) -> list[list[bool]]:
    rows = [[bool(v) for v in row] for row in qr.matrix]
    width = len(rows[0]) + BORDER * 2
    blank = [[False] * width for _ in range(BORDER)]
    padded = [[False] * BORDER + row + [False] * BORDER for row in rows]
    return blank + padded + blank


def render(data: str, style: str = "compact") -> Text:
    """compact: half blocks, two modules per line (default)
    wide: coloured spaces, works in any colour terminal, twice as tall
    ascii: plain characters for logs and terminals without colour
    """
    text = _render(data, style)
    text.right_crop(1)  # the trailing newline
    return text


def _render(data: str, style: str) -> Text:
    grid = _grid(make(data))
    text = Text(no_wrap=True, overflow="ignore")

    if style == "ascii":
        for row in grid:
            text.append("".join("##" if dark else "  " for dark in row) + "\n")
        return text

    if style == "wide":
        for row in grid:
            for dark in row:
                text.append("  ", style="on #000000" if dark else "on #ffffff")
            text.append("\n")
        return text

    if len(grid) % 2:
        grid.append([False] * len(grid[0]))
    for top, bottom in zip(grid[::2], grid[1::2]):
        line = "".join(HALF_BLOCKS[pair] for pair in zip(top, bottom))
        text.append(line, style="#000000 on #ffffff")
        text.append("\n")
    return text


def width(data: str, style: str = "compact") -> int:
    """Terminal columns the rendered code needs."""
    cols = len(_grid(make(data))[0])
    return cols if style == "compact" else cols * 2


def save(data: str, path: Path, scale: int = 10) -> Path:
    """Writes a PNG or SVG, picked from the file extension."""
    make(data).save(str(path), scale=scale, border=4, dark="#1e1b1a", light="#ffffff")
    return path


def to_image(data: str, size: int) -> Image.Image:
    """A crisp RGBA image of the code at most `size` pixels square, quiet zone included.

    Modules are scaled by a whole number so every one stays the same width.
    """
    grid = _grid(make(data))
    img = Image.new("RGBA", (len(grid[0]), len(grid)), (255, 255, 255, 255))
    for y, row in enumerate(grid):
        for x, dark in enumerate(row):
            if dark:
                img.putpixel((x, y), (30, 27, 26, 255))
    scale = max(1, size // len(grid))
    return img.resize((len(grid[0]) * scale, len(grid) * scale), Image.NEAREST)
