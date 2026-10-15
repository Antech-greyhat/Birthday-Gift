"""Star signs, birthstones and friends, ported from src/tools/countdown/astro.js.

Months are 1 based here (January is 1), unlike the JavaScript original.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Sign:
    name: str
    symbol: str
    end: tuple[int, int]
    range: str
    element: str
    planet: str
    traits: tuple[str, ...]


ZODIAC = [
    Sign("Capricorn", "♑", (1, 19), "Dec 22 – Jan 19", "Earth", "Saturn", ("Ambitious", "Disciplined", "Wise")),
    Sign("Aquarius", "♒", (2, 18), "Jan 20 – Feb 18", "Air", "Uranus", ("Original", "Independent", "Humanitarian")),
    Sign("Pisces", "♓", (3, 20), "Feb 19 – Mar 20", "Water", "Neptune", ("Compassionate", "Artistic", "Intuitive")),
    Sign("Aries", "♈", (4, 19), "Mar 21 – Apr 19", "Fire", "Mars", ("Bold", "Energetic", "Courageous")),
    Sign("Taurus", "♉", (5, 20), "Apr 20 – May 20", "Earth", "Venus", ("Reliable", "Patient", "Devoted")),
    Sign("Gemini", "♊", (6, 20), "May 21 – Jun 20", "Air", "Mercury", ("Curious", "Witty", "Adaptable")),
    Sign("Cancer", "♋", (7, 22), "Jun 21 – Jul 22", "Water", "Moon", ("Caring", "Loyal", "Protective")),
    Sign("Leo", "♌", (8, 22), "Jul 23 – Aug 22", "Fire", "Sun", ("Confident", "Generous", "Warm")),
    Sign("Virgo", "♍", (9, 22), "Aug 23 – Sep 22", "Earth", "Mercury", ("Thoughtful", "Precise", "Kind")),
    Sign("Libra", "♎", (10, 22), "Sep 23 – Oct 22", "Air", "Venus", ("Charming", "Fair", "Social")),
    Sign("Scorpio", "♏", (11, 21), "Oct 23 – Nov 21", "Water", "Pluto", ("Passionate", "Brave", "Magnetic")),
    Sign("Sagittarius", "♐", (12, 21), "Nov 22 – Dec 21", "Fire", "Jupiter", ("Adventurous", "Optimistic", "Free")),
]

# (name, meaning) per month
BIRTHSTONES = [
    ("Garnet", "Friendship and trust"),
    ("Amethyst", "Peace and clarity"),
    ("Aquamarine", "Courage and calm"),
    ("Diamond", "Strength and eternal love"),
    ("Emerald", "Rebirth and love"),
    ("Pearl", "Purity and wisdom"),
    ("Ruby", "Passion and protection"),
    ("Peridot", "Strength and good luck"),
    ("Sapphire", "Wisdom and loyalty"),
    ("Opal", "Hope and creativity"),
    ("Topaz", "Joy and warmth"),
    ("Turquoise", "Good fortune and success"),
]

# (name, also, meaning) per month
BIRTH_FLOWERS = [
    ("Carnation", "Snowdrop", "Love and admiration"),
    ("Violet", "Primrose", "Loyalty and faithfulness"),
    ("Daffodil", "Jonquil", "New beginnings"),
    ("Daisy", "Sweet pea", "Innocence and joy"),
    ("Lily of the valley", "Hawthorn", "Sweetness and humility"),
    ("Rose", "Honeysuckle", "Love and passion"),
    ("Larkspur", "Water lily", "Lightness and laughter"),
    ("Gladiolus", "Poppy", "Strength of character"),
    ("Aster", "Morning glory", "Wisdom and faith"),
    ("Marigold", "Cosmos", "Warmth and creativity"),
    ("Chrysanthemum", "Peony", "Friendship and cheer"),
    ("Narcissus", "Holly", "Hope and good wishes"),
]

ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]

# Indexed by Python weekday(), Monday first
RHYME = [
    "Monday's child is fair of face",
    "Tuesday's child is full of grace",
    "Wednesday's child is full of woe",
    "Thursday's child has far to go",
    "Friday's child is loving and giving",
    "Saturday's child works hard for a living",
    "Sunday's child is bonny and blithe, good and gay",
]


def zodiac_of(month: int, day: int) -> Sign:
    for sign in ZODIAC:
        end_month, end_day = sign.end
        if month < end_month or (month == end_month and day <= end_day):
            return sign
    return ZODIAC[0]


def chinese_zodiac_of(year: int, month: int, day: int) -> tuple[str, bool]:
    """Returns the animal and whether it may be the previous one.

    Lunar new year falls between Jan 21 and Feb 20, so early year dates are approximate.
    """
    y = year - 1 if month == 1 and day < 21 else year
    approximate = (month == 1 and day >= 21) or (month == 2 and day <= 20)
    return ANIMALS[(y - 4) % 12], approximate


def generation_of(year: int) -> str:
    if year >= 2025:
        return "Gen Beta"
    if year >= 2013:
        return "Gen Alpha"
    if year >= 1997:
        return "Gen Z"
    if year >= 1981:
        return "Millennial"
    if year >= 1965:
        return "Gen X"
    if year >= 1946:
        return "Baby Boomer"
    return "Silent Generation"
