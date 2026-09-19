# Announcement · Classroom Chime

A lightweight classroom announcement tool with a two-note chime and browser text-to-speech.

**[Live demo](https://class-chime.netlify.app/)**

## Features

- Type a custom message or use one of three classroom presets.
- Choose an English voice and preview it.
- Adjust speech speed from **0.5× to 2×** (default: 1×).
- Repeat announcements **1–1000 times** (default: 1); each round includes a chime.
- Stop cancels speech, the chime, and any remaining repeats.
- Responsive layout, with no build step, API key, or backend required.

## Run locally

Clone this repository, then run from its root:

```sh
python3 -m http.server 5173 --bind 127.0.0.1 --directory dist
```

Open **http://127.0.0.1:5173/** in a browser supporting the Web Speech API and Web Audio API. Click Preview to audition a voice, or Chime & speak to play your message. Preview plays once regardless of the repeat setting.

## Files

- `dist/index.html` — interface and preset announcement text
- `dist/style.css` — responsive styling
- `dist/app.js` — voice selection, speech, chime, and repeat controls
- `dist/favicon.svg` — site icon

The `dist/` directory contains the authored source; it is not generated or minified build output. Edit these files directly. To change a preset's spoken message, edit its `data-announcement` attribute in `index.html`.

## Hosting

Serve `dist/` through any static web host. For a manual Netlify deployment, upload `dist/` or a ZIP containing its contents. No build command is needed. Publishing changes may consume your hosting provider's deployment allowance.

## Voice and privacy notes

Available voices and pronunciation depend on the browser and operating system. The app prefers common local voices and ranks novelty voices lower, but they remain selectable. Some browser voices use an online service, so offline availability and processing depend on the selected voice provider. Speed is passed to the browser speech engine; exact timing varies.

The app has no application server and does not store announcement text. It loads DM Sans and Manrope from Google Fonts, falling back to system sans-serif fonts if unavailable. Long playback can be interrupted by browser backgrounding, device sleep, or voice-engine errors.

## License

MIT — see [LICENSE](LICENSE). Browser/OS voice services and externally served fonts are governed by their respective providers and licenses.
