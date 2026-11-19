# Code Blocks (CodeCraft) — standalone build

Source for Code Blocks, published at https://codecraft.teachingtools.dev by the GitHub Actions workflow in this repo (a copy also lives in presac1a as `codecraft.html`).

- `npm install`, then `npm run build` → `dist/codecraft.html` (one file, about 12 MB, works offline).
- Python (Pyodide 0.29.0) is added to the page by `scripts/embed-pyodide.mjs`.
- AI: `src/services/aiAccess.ts` uses the teachingtools.dev pass (`src/vendor/eduai-connect.js`) and falls back to the user's own OpenAI key. Keys are never shown.
- Tests (Playwright, need `codecraft.html` beside them): `tests/test_basic.py`, `tests/test_ai.py`, `tests/test_lessons.py`.
