# Audio Coding Demos

Experimental playground for audio-related web demos.
Built with plain HTML, CSS and JavaScript.
Published via GitHub Pages.

## Live demos

👉 https://JukkaTLinjama.github.io/audio-coding/

The landing page (`index.html`) automatically renders the demo list
from a JSON manifest (`demos.json`).

## Repository structure

```
audio-coding/
├── index.html        # Demo hub (GitHub Pages entry)
├── demos.json        # Demo manifest (single source of truth)
├── assets/           # Screenshots / thumbnails (no subfolders)
│   └── vibro-keyboard.png
└── Vibroacoustic/
    └── vibro-keyboard1.html
```

## Demo manifest (`demos.json`)

Each demo is described declaratively:

- `title` – demo name
- `path` – relative link to the demo HTML
- `thumb` – screenshot thumbnail (served from `/assets`)
- `status` – WIP / stable / archived
- `description` – short technical description
- `tags` – optional metadata for filtering

Adding a new demo usually means **only editing `demos.json`**.

## Design principles

- No build step
- No frameworks
- Static hosting (GitHub Pages)
- JSON-driven documentation
- Each demo is self-contained

## Notes on audio

Some demos use the Web Audio API and require
a user gesture (click / key press) to start audio output.
This is a browser security requirement.

---

MIT-style usage: feel free to explore, fork, and experiment.
