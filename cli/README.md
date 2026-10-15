<div align="center">

# Birthday Studio · Terminal

**Countdowns, wishes and invitations in your terminal, shared with a QR code.**

<img src="https://img.shields.io/badge/Python-3.10%2B-4f7cff?style=flat-square&logo=python&logoColor=white" alt="Python 3.10+" />
<img src="https://img.shields.io/badge/Runs-locally_only-19c2a0?style=flat-square" alt="Runs locally only" />
<img src="https://img.shields.io/badge/Party_Mode-LAN-ff5d73?style=flat-square" alt="Party Mode on your local network" />

`Typer` · `Rich` · `Textual` · `segno` · `Pillow`

</div>

```
╔╗  ╦ ╦═╗ ╔╦╗ ╦ ╦ ╔╦╗ ╔═╗ ╦ ╦    ╔═╗ ╔╦╗ ╦ ╦ ╔╦╗ ╦ ╔═╗
╠╩╗ ║ ╠╦╝  ║  ╠═╣  ║║ ╠═╣ ╚╦╝    ╚═╗  ║  ║ ║  ║║ ║ ║ ║
╚═╝ ╩ ╩╚═  ╩  ╩ ╩ ═╩╝ ╩ ╩  ╩     ╚═╝  ╩  ╚═╝ ═╩╝ ╩ ╚═╝
  countdowns · wishes · invitations · party mode
```

This is the command line companion to the [Birthday Studio website](https://birthday-gift-wish.vercel.app/). It is not deployed anywhere. You clone the repository and run it on your own computer.

---

## Install

```bash
git clone https://github.com/Antech-greyhat/Birthday-Gift.git
cd Birthday-Gift/cli
pip install .
```

`pipx install .` works too and keeps the app in its own environment. Either way you get a `bday` command. Without installing, `python -m birthday_cli` runs it from this folder once the dependencies are present.

| Platform | Notes |
| --- | --- |
| Windows | Use Windows Terminal for crisp QR codes. Allow Python through the firewall when Party Mode asks |
| macOS, Linux | Any modern terminal works |
| Old or colourless terminals | Add `--qr-style wide` or `--qr-style ascii` |

---

## Commands

| Command | What it does |
| --- | --- |
| `bday` | Opens the full screen app |
| `bday countdown NAME MM-DD` | Countdown with star sign, birthstone, birth flower and date facts |
| `bday wish` | Picks one of the 216 hand written wishes and puts it on a card |
| `bday invite` | Builds a party invitation with RSVP details, a calendar file and a poster |
| `bday party` | Serves the invitation on your Wi-Fi and collects RSVPs and wishes |
| `bday share LINK` | Turns any link into a QR code and share links |
| `bday list designs\|recipients\|moods` | Shows what you can pick from |

Every command has `--help`.

### Options every card shares

| Option | Effect |
| --- | --- |
| `--design, -d` | Card design: `confetti`, `golden`, `pastel`, `balloons`, `sunset`, `floral`, `neon`, `minimal`, `kids`, `love` |
| `--no-qr` | Skip the QR code and only print the link |
| `--qr-style` | `compact` (default), `wide` for picky scanners, `ascii` for plain text |
| `--links` | Also print WhatsApp, Telegram, X, Facebook and email share links |
| `--poster FILE.png` | Save a printable 1080 × 1350 poster with the QR code on it |
| `--qr-file FILE` | Save the QR code alone, as `.png` or `.svg` |
| `--open` | Open the card in your browser |

### Countdown

```bash
bday countdown Ava 05-14
bday countdown Ava 05-14 --year 1998 --live          # ticks until Ctrl+C
bday countdown Ava 05-14 --ics ava.ics               # yearly calendar reminder
```

The year unlocks the age being turned, Chinese zodiac, generation, weekday of birth and life stats. Leap day birthdays count down to 28 February in common years, as on the website.

### Wishes

```bash
bday wish --to Ava --from Sam                        # a random wish
bday wish --for mom --mood funny --list              # browse and number them
bday wish --for mom --mood funny --pick 3 --poster wish.png
bday wish --to Ava --message "Your own words"        # write your own
```

`--for` takes a recipient such as `mom`, `bestie` or `boss`. `--mood` takes `heartfelt`, `funny`, `short` or `inspirational`. `--search` filters by text.

### Invitations

```bash
bday invite --example                                # the sample party
bday invite --name Ava --age 7 --date 2026-11-02 --time 16:00 --end 19:00 \
            --venue "Sunny Park" --host "Emma" --rsvp "+1 555 012 3456" \
            --save party.json --ics party.ics --poster party.png
bday invite --from-link "https://birthday-gift-wish.vercel.app/#/invitation?view=1&p=..."
```

`--load FILE` starts from a saved invitation, and any options you add override it. `--party` goes straight into Party Mode.

---

## Sharing

**Scan to open.** The QR code holds the same address the website builds, with the card packed into the link. A phone camera opens the animated card on the live site. Nothing is uploaded and there is no account. Set `BDAY_BASE_URL` to point the links at your own fork or a local `npm run dev`.

**Paper invitations.** `--poster` prints the details and the QR code onto a PNG you can print or send as an image.

**Party Mode.** No internet needed, only a shared Wi-Fi network.

```bash
bday party party.json                 # an invitation saved with --save
bday party --example                  # try it with the sample party
bday party party.json --poster door.png   # a poster whose code opens the party page
```

| Who | Sees |
| --- | --- |
| You, in the terminal | The QR code, a live RSVP table with head counts, the newest wishes and an activity log |
| Guests, on their phones | The invitation, an RSVP form, a calendar button, a map link and a wish form |
| Everyone, on a TV | The wish wall at the `/wall` link, which updates every few seconds |

| Detail | Behaviour |
| --- | --- |
| Address | `http://<your-ip>:8737/<random-token>/`. Anything without the token gets a 404 |
| Saved replies | `~/.birthday-studio/parties/`, or the file given with `--data` |
| Restarting | Keeps the same token, RSVPs and wishes, so printed posters keep working. `--fresh` starts over |
| Repeat RSVPs | A second reply under the same name replaces the first |
| Limits | 280 character wishes, a short cooldown between posts, a size limit on every form |
| Privacy | RSVP notes are only shown to you. The wall shows names and wishes only |
| Wrong address in the code | Pass `--public-host 192.168.x.x`, or `--port` if 8737 is taken |
| Keep it on this computer | `--bind 127.0.0.1` |

---

## Full screen app

Run `bday` with no command. Pick a tool with <kbd>c</kbd>, <kbd>w</kbd> or <kbd>i</kbd>. Fill the form on the left and the card, QR code and link update on the right.

| Key | Action |
| --- | --- |
| <kbd>Ctrl</kbd>+<kbd>S</kbd> | Save a poster to the current folder |
| <kbd>Ctrl</kbd>+<kbd>O</kbd> | Open the card in your browser |
| <kbd>Ctrl</kbd>+<kbd>R</kbd> | Shuffle to another wish |
| <kbd>Ctrl</kbd>+<kbd>L</kbd> | Load the example invitation |
| <kbd>Ctrl</kbd>+<kbd>T</kbd> | Start Party Mode from the invitation |
| <kbd>Esc</kbd> | Go back, or stop Party Mode |
| <kbd>Ctrl</kbd>+<kbd>Q</kbd> | Quit |

---

## Development

```bash
cd cli
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
pytest
```

```
birthday_cli/
├── app.py              the bday command (Typer)
├── tui/app.py          the full screen app (Textual)
├── views.py            Rich layouts shared by both
├── banner.py           wordmark and big countdown digits
├── core/               countdown maths, star signs, wishes, invitations, calendar files
├── share/              links, QR codes, Party Mode server and its two pages
├── render/poster.py    printable posters (Pillow)
└── data/wishes.json    the wish library
```

The wishes in `data/wishes.json` are a copy of `src/tools/wishes/messages.js`. When you add a wish on the website, add it here too. Links are encoded the same way as `src/lib/url.js`, and a test checks the two match byte for byte.
