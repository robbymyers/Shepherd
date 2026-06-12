# Shepherd

A personal CrossFit + running performance tracker for Rob Myers — replacing the
aging myWOD app. Built with Next.js (App Router) and deployed via Vercel.

Design authority: the [Fitness Tracker Figma](https://www.figma.com/design/59wjnxmtV3W0dfqkmgZirs/Fitness-Tracker)
and `../Inspiration/Design.pdf`. Palette + typography live in `../CLAUDE.md`.

## Running

```bash
npm install
npm run dev            # http://localhost:3000 (or PORT=3100 npm run dev)
npm run build && npm start
```

## Data

All data is extracted **once** from the raw sources in `../Data/` into a single
seed file the app reads at runtime:

```bash
npm run extract        # -> public/data/seed.json
```

`scripts/extract.py` pulls from:

| Source | Produces |
|--------|----------|
| `Data/data.mywod` (SQLite) | movements + lift sessions, logged WODs |
| `Data/StravaData/activities.csv` | events (runs / workouts / walks) |
| `Data/crossfit-hero-wods.json` | Hero WOD reference library (merged w/ logged) |
| `Data/vo2max_data.json` | VO2 max history |

Derived in the script: PR highlights, run highlights (best 5K/10K/15K), and the
merged WOD library where each entry carries a `logged` flag.

> ⚠️ `MovementSessions` joins `Movement` on **both** `foreignMovementClientID`
> and `foreignMovementRecordID`. Movement record IDs are not globally unique, so
> app IDs are name slugs (`mv-front-squat`), not the raw record ID.

## Architecture

- **State** — `lib/store.tsx` loads `seed.json`, then layers user edits on top and
  persists everything to `localStorage` (`shepherd:data:v1`). All CRUD
  (events / sessions / scores) and the Progress card order flow through it.
- **Theme** — default follows `prefers-color-scheme`; manual override stored as
  `theme` and applied as `data-theme` on `<html>` before first paint.
- **Styling** — plain CSS + CSS variables (the Shepherd tokens), no Tailwind.
  Display font is the licensed Futura Condensed Bold (`public/fonts/`), body is SF Pro.

## Screens

| Route | What |
|-------|------|
| `/` | **Events** — runs + workouts by date, filter chips, add / edit / delete |
| `/train` | **Train** — Movements / Workouts library; stopwatch toggles "logged only" |
| `/train/movement/[id]` | lift history, % percentages table, add session |
| `/train/wod/[id]` | WOD description, score history, record score |
| `/progress` | **Progress** — calendar (run/workout days), drag-to-reorder VO2 / PR / Runs |
| `/account` | **Account** — stats, theme toggle, reset |
