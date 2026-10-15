"""Printable PNG posters with a QR code that opens the live card.

These are simpler than the animated canvas posters in the web app on purpose:
a theme gradient, the words and a code to scan.
"""

from __future__ import annotations

import random
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from ..core.themes import get_theme
from ..share import qr

WIDTH, HEIGHT = 1080, 1350
MARGIN = 96

SERIF = ["georgia.ttf", "Georgia.ttf", "DejaVuSerif.ttf", "LiberationSerif-Regular.ttf"]
SERIF_BOLD = ["georgiab.ttf", "Georgia Bold.ttf", "DejaVuSerif-Bold.ttf", "LiberationSerif-Bold.ttf"]
SANS = ["segoeui.ttf", "Arial.ttf", "arial.ttf", "DejaVuSans.ttf", "LiberationSans-Regular.ttf"]
FONT_DIRS = [
    "",
    "C:/Windows/Fonts/",
    "/System/Library/Fonts/Supplemental/",
    "/Library/Fonts/",
    "/usr/share/fonts/truetype/dejavu/",
]

# Emoji and pictographs are not in common system fonts, so they are left out of posters
_NO_GLYPH = re.compile("[\U00010000-\U0010ffff\u2600-\u27bf\ufe0f]")


def _font(names: list[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for name in names:
        for folder in FONT_DIRS:
            try:
                return ImageFont.truetype(folder + name, size)
            except OSError:
                continue
    return ImageFont.load_default(size)


def _rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _gradient(stops: tuple[str, ...]) -> Image.Image:
    colors = [_rgb(c) for c in stops] or [(255, 255, 255)]
    if len(colors) == 1:
        return Image.new("RGB", (WIDTH, HEIGHT), colors[0])
    img = Image.new("RGB", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)
    segments = len(colors) - 1
    for y in range(HEIGHT):
        pos = y / (HEIGHT - 1) * segments
        i = min(int(pos), segments - 1)
        f = pos - i
        a, b = colors[i], colors[i + 1]
        draw.line([(0, y), (WIDTH, y)], fill=tuple(round(a[k] + (b[k] - a[k]) * f) for k in range(3)))
    return img


def _wrap(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        line = ""
        for word in paragraph.split():
            trial = f"{line} {word}".strip()
            if draw.textlength(trial, font=font) <= max_width or not line:
                line = trial
            else:
                lines.append(line)
                line = word
        lines.append(line)
    return lines


def _fit(draw, text: str, names: list[str], start: int, minimum: int, max_width: int, max_lines: int):
    """Largest font size at which the text wraps into max_lines."""
    size = start
    while True:
        font = _font(names, size)
        lines = _wrap(draw, text, font, max_width)
        if len(lines) <= max_lines or size <= minimum:
            return font, lines[:max_lines]
        size -= 4


def clean(text: str) -> str:
    return re.sub(r"\s{2,}", " ", _NO_GLYPH.sub("", text)).strip()


def render_poster(
    path: Path, *, theme: str, eyebrow: str, title: str, body: str, footer: str = "", url: str = ""
) -> Path:
    th = get_theme(theme)
    img = _gradient(th.bg).convert("RGBA")

    # A light scatter of confetti in the theme colours
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    dots = ImageDraw.Draw(layer)
    rng = random.Random(title)
    for _ in range(46):
        x, y, r = rng.randrange(WIDTH), rng.randrange(HEIGHT), rng.randrange(5, 15)
        color = _rgb(rng.choice([th.accent, th.sub, th.accent]))
        dots.ellipse([x - r, y - r, x + r, y + r], fill=(*color, 70))
    img = Image.alpha_composite(img, layer)

    draw = ImageDraw.Draw(img)
    ink, sub, accent = _rgb(th.ink), _rgb(th.sub), _rgb(th.accent)
    inner = WIDTH - MARGIN * 2
    draw.rectangle([36, 36, WIDTH - 36, HEIGHT - 36], outline=(*accent, 255), width=4)

    y = MARGIN + 30
    small = _font(SANS, 34)
    eyebrow = clean(eyebrow).upper()
    draw.text((WIDTH / 2, y), eyebrow, font=small, fill=accent, anchor="mt")
    y += 80

    title_font, title_lines = _fit(draw, clean(title), SERIF_BOLD, 96, 52, inner, 3)
    for line in title_lines:
        draw.text((WIDTH / 2, y), line, font=title_font, fill=ink, anchor="mt")
        y += int(title_font.size * 1.15)
    y += 30
    draw.line([(WIDTH / 2 - 70, y), (WIDTH / 2 + 70, y)], fill=accent, width=5)
    y += 50

    qr_size = 340 if url else 0
    body_room = HEIGHT - y - MARGIN - qr_size - (110 if footer else 40)
    body_font, body_lines = _fit(draw, clean(body), SERIF, 50, 28, inner, max(1, body_room // 62))
    for line in body_lines:
        draw.text((WIDTH / 2, y), line, font=body_font, fill=sub, anchor="mt")
        y += int(body_font.size * 1.4)

    if footer:
        draw.text((WIDTH / 2, y + 30), clean(footer), font=_font(SERIF_BOLD, 40), fill=ink, anchor="mt")

    if url:
        code = qr.to_image(url, qr_size - 40)
        cx, cy = (WIDTH - code.width) // 2, HEIGHT - MARGIN - code.height - 30
        draw.rounded_rectangle(
            [cx - 14, cy - 14, cx + code.width + 14, cy + code.height + 14], radius=22, fill=(255, 255, 255, 255)
        )
        img.alpha_composite(code, (cx, cy))
        draw.text((WIDTH / 2, cy + code.height + 30), "Scan to open", font=_font(SANS, 26), fill=sub, anchor="mt")

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(path)
    return path
