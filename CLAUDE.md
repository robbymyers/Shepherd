# CLAUDE.md — Project Context

This file is the source of truth for Claude Code and any AI assistant working on this project. Read it fully before writing any code.

---

## Project Overview

A personal CrossFit + running performance tracker for **Robby Myers** — designer, CrossFitter, trail runner. Built to replace the aging myWOD app with something modern, personal, and eventually Strava-connected.

**Stack path:** Figma (design) → Claude Code → GitHub → Vercel  
**Design authority:** Robby owns the design. Claude Code implements it — don't invent UI. Follow the Figma designs.

### V1 Scope
- View all past WOD history (imported from myWOD)
- View all past lift sessions + PRs by movement
- Log new completed WODs
- Log new lift sessions
- Hero WOD reference library (74 workouts)

### V2 (future)
- Strava integration (running data)
- AI-powered suggestions / goal setting

---

## Design System — Shepherd Color Palette

Use these CSS variable names consistently. Do not use hardcoded hex values in components. All tokens are defined for both dark and light mode.

### Theme Strategy
- **Default:** respect `prefers-color-scheme` (follows system setting)
- **Override:** user can manually toggle in the UI, stored in `localStorage` as `theme: "dark" | "light"`
- **Implementation:** apply `[data-theme="dark"]` or `[data-theme="light"]` on `<html>`. On load, check `localStorage` first — if no value, fall back to `prefers-color-scheme`. The manual toggle writes to `localStorage` and flips the attribute.

```js
// Theme init — run before paint to avoid flash
const stored = localStorage.getItem('theme');
const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', stored ?? system);
```

> The scale values invert between modes for most ramps (e.g. Green-800 is dark in dark mode, light in light mode). Green, Pink, and Purple base colors stay the same across both modes.

### Black
| Variable | Dark | Light |
|----------|------|-------|
| `--color-black` | `#171717` | `#EEEEEE` |
| `--color-black-600` | `#000000` | `#FFFFFF` |
| `--color-black-500` | `#303030` | `#FCFCFC` |
| `--color-black-400` | `#454545` | `#979797` |
| `--color-black-300` | `#747474` | `#656565` |
| `--color-black-200` | `#A2A2A2` | `#454545` |

### White
| Variable | Dark | Light |
|----------|------|-------|
| `--color-white` | `#EEEEEE` | `#171717` |
| `--color-white-offwhite` | `#FAF3E1` | `#171717` |
| `--color-white-800` | `#656565` | `#454545` |
| `--color-white-700` | `#979797` | `#747474` |
| `--color-white-600` | `#CACACA` | `#A2A2A2` |

### Green (primary accent)
| Variable | Dark | Light |
|----------|------|-------|
| `--color-green` | `#BBD87A` | `#BBD87A` |
| `--color-green-800` | `#4B5631` | `#E4EFCA` |
| `--color-green-700` | `#708249` | `#D6E8AF` |
| `--color-green-600` | `#96AD62` | `#C9E095` |
| `--color-green-400` | `#C9E095` | `#96AD62` |
| `--color-green-300` | `#D6E8AF` | `#708249` |
| `--color-green-200` | `#E4EFCA` | `#4B5631` |

### Pink
| Variable | Dark | Light |
|----------|------|-------|
| `--color-pink` | `#DB4E90` | `#DB4E90` |
| `--color-pink-800` | `#581F3A` | `#F1B8D3` |
| `--color-pink-700` | `#832F56` | `#E995BC` |
| `--color-pink-600` | `#AF3E73` | `#E271A6` |
| `--color-pink-400` | `#E271A6` | `#AF3E73` |
| `--color-pink-300` | `#E995BC` | `#832F56` |
| `--color-pink-200` | `#F1B8D3` | `#581F3A` |

### Purple
| Variable | Dark | Light |
|----------|------|-------|
| `--color-purple` | `#7A6AB3` | `#7A6AB3` |
| `--color-purple-800` | `#312A48` | `#CAC3E1` |
| `--color-purple-700` | `#49406B` | `#AFA6D1` |
| `--color-purple-600` | `#62558F` | `#9588C2` |
| `--color-purple-400` | `#9588C2` | `#62558F` |
| `--color-purple-300` | `#AFA6D1` | `#49406B` |
| `--color-purple-200` | `#CAC3E1` | `#312A48` |

---

## Design System — Typography

**Display / Headings:** Futura Condensed Bold  
**Body / UI:** SF Pro  
**Base value:** 21px (1.000rem) — **Scale:** 1.375

| Step | px | rem |
|------|----|-----|
| 9 | 75px | 3.571rem |
| 8 | 55px | 2.619rem |
| 7 | 40px | 1.905rem |
| 6 | 29px | 1.381rem |
| 5 (base) | 21px | 1.000rem |
| 4 | 15px | 0.714rem |
| 3 | 11px | 0.524rem |
| 2 | 8px | 0.381rem |
| 1 | 6px | 0.286rem |

### Usage
- **Futura Condensed Bold** — hero numbers, WOD names, PR callouts, section headers, anything that needs athletic punch
- **SF Pro** — body copy, labels, metadata, notes, all UI chrome

> Futura Condensed Bold is not a Google Font. It must be served as a local or licensed web font. Confirm delivery method before shipping.

---

## Athlete Profile

Extracted from `data.mywod` (SQLite, exported May 2026):

- **Email:** robby.myers@gmail.com
- **Box:** Unaffiliated
- **Units:** Imperial (lbs)
- **Data range:** January 2020 – May 2026

---

## myWOD Data — Structure

The `.mywod` file is a **SQLite 3 database**. It was exported and the relevant tables are:

### Tables

#### `MyWODs` — Completed WODs (47 records)
| Field | Type | Notes |
|-------|------|-------|
| `title` | string | WOD name (e.g. "Murph", "Fran", or custom) |
| `date` | string | `YYYY-MM-DD` |
| `scoreType` | string | "For Time", "For Rounds", "For Repetitions" |
| `score` | string | e.g. `"43:38"`, `"19+11"`, `"220"` |
| `personalRecord` | int | `1` = PR |
| `asPrescribed` | int | `1` = Rx |
| `description` | string | WOD description as entered |
| `notes` | string | Athlete notes |

#### `Movement` — Tracked lifts (21 active)
Named lifts the athlete logs separately from WODs (e.g. Back Squat, Clean & Jerk).

#### `MovementSessions` — Lift logs (141 records)
| Field | Notes |
|-------|-------|
| `date` | `YYYY-MM-DD` |
| `measurementAValue` | weight in lbs |
| `measurementB` | reps |
| `sets` | sets |
| `notes` | session notes |

> ⚠️ JOIN NOTE: `MovementSessions` links to `Movement` via **both** `foreignMovementClientID` AND `foreignMovementRecordID`. Joining on `primaryRecordID` alone causes duplicates. Always join on both fields.

---

## Personal Records (PRs)

### Benchmark WODs
| WOD | Score | Type | Date | Rx? |
|-----|-------|------|------|-----|
| Fran | 4:16 | For Time | 2025-03-24 | ✅ |
| Cindy | 19+11 | For Rounds | 2025-05-09 | ✅ |
| Elizabeth | 8:51 | For Time | 2025-05-29 | ✅ |
| Murph | 43:38 | For Time | 2025-05-24 | — |
| Jackie | 7:43 | For Time | 2024-03-25 | ✅ |
| Grace | 3:40 | For Time | 2023-09-05 | ✅ |
| Helen | 10:48 | For Time | 2023-08-17 | ✅ |
| 2K Row | 8:11 | For Time | 2024-05-13 | — |

### Lifts (1RM unless noted)
| Movement | PR | Date |
|----------|----|------|
| Dead Lift | 405 lbs | 2024-01-10 |
| Back Squat | 355 lbs | 2023-05-01 |
| Front Squat | 335 lbs | 2023-04-24 |
| Clean | 260 lbs | 2024-06-03 |
| Clean & Jerk | 245 lbs | 2024-02-06 |
| Hang Squat Clean | 235 lbs | 2024-07-26 |
| Push Press | 225 lbs | 2024-09-30 |
| Bench Press | 220 lbs | 2023-06-06 |
| Push Jerk | 220 lbs | 2022-04-14 |
| Cluster | 205 lbs | 2024-07-17 |
| Jerk | 200 lbs | 2022-04-19 |
| Snatch | 185 lbs | 2024-03-27 |
| Overhead Squat | 185 lbs (3x3) | 2023-12-05 |
| Hang Power Snatch | 165 lbs | 2023-10-20 |
| Press | 145 lbs | 2023-04-27 |
| Squat Snatch | 140 lbs | 2021-09-30 |
| Shoulder Press | 135 lbs | 2021-09-21 |

---

## Hero WODs Reference

**Source:** `crossfit-hero-wods.json` (74 workouts from crossfit.com/heroes)  
**Full list:** 248 total at [crossfit.com/heroes](https://www.crossfit.com/heroes)  
**Full PDF:** https://www.crossfit.com/wp-content/uploads/2026/05/20135556/Heroes_20260520.pdf

Each WOD object has this shape:
```json
{
  "name": "Murph",
  "type": "For Time",
  "structure": "optional — e.g. '5 rounds'",
  "movements": ["1-mile run", "100 pull-ups", "..."],
  "weight": {
    "female": "...",
    "male": "..."
  },
  "note": "optional",
  "url": "https://www.crossfit.com/benchmark/murph"
}
```

Notable Hero WODs in the dataset that Robby has logged:
- **Murph** — logged 3× (2022, 2025×2). PR: 43:38 unweighted (May 2025)

---

## Complete WOD Log (47 entries)

All entries from myWOD, newest first:

| Title | Date | Score | Type | PR | Rx |
|-------|------|-------|------|----|----|
| Murph | 2026-05-23 | 48:21 | For Time | — | — |
| Elizabeth | 2025-05-29 | 08:51 | For Time | ✅ | ✅ |
| Murph | 2025-05-24 | 43:38 | For Time | ✅ | — |
| Cindy | 2025-05-09 | 19+11 | For Rounds | ✅ | ✅ |
| Fight Gone Bad | 2025-04-24 | 220 | For Repetitions | — | ✅ |
| Fran | 2025-03-24 | 04:16 | For Time | ✅ | ✅ |
| Grace | 2025-02-20 | 4:20 | For Time | — | ✅ |
| 2K Row | 2025-02-17 | 8:19 | For Time | — | — |
| The Chief | 2024-07-22 | 405 | For Rounds | — | — |
| 2K Row | 2024-05-13 | 8:11 | For Time | ✅ | — |
| Cindy | 2024-05-06 | 18+12 | For Rounds | — | ✅ |
| Jackie | 2024-03-25 | 07:43 | For Time | ✅ | ✅ |
| Fight Gone Bad | 2023-12-07 | 292 | For Repetitions | ✅ | ✅ |
| Cindy | 2023-11-06 | 18+7 | For Rounds | — | ✅ |
| Grace | 2023-09-05 | 3:40 | For Time | ✅ | ✅ |
| Helen | 2023-08-17 | 10:48 | For Time | ✅ | ✅ |
| Omar | 2023-06-14 | 13:28 | For Time | ✅ | ✅ |
| Fran | 2023-05-04 | 05:07 | For Time | ✅ | ✅ |
| Murph | 2023-05-27 | 49:18 | For Time | — | — |
| *(+ 28 more entries back to Jan 2020)* | | | | | |

> Full JSON available in `mywod_data.json` at project root.

---

## Data Files

| File | Description |
|------|-------------|
| `mywod_data.json` | Cleaned export of all myWOD data — WODs + lift sessions |
| `crossfit-hero-wods.json` | 74 Hero WODs from crossfit.com |
| `crossfit-hero-wods-alpha.md` | Same 74 Hero WODs in markdown |
| `Shepherd-color-variables.md` | Full color token reference |

---

## Strava Data

**Source:** `strava_activities.json` (exported May 2026, cleaned from Strava bulk export)  
**Date range:** August 2024 – May 2026  
**Total activities:** 108 — Runs (88), CrossFit/HIIT Workouts (17), Walks (3)

### Activity Feed — Train Section
Activities display as a scrollable feed sorted **oldest → newest** (earliest at top). Each card surfaces:

| Field | Notes |
|-------|-------|
| `Activity Date` | Display date + time |
| `Activity Name` | User-entered title (e.g. "Lunch Trail Run") |
| `Activity Type` | `Run`, `Workout`, `Walk` — determines card style |
| `Activity Description` | Free-text notes from Strava |
| `Moving Time` | Seconds — convert to `HH:MM:SS` for display |
| `Distance` | Miles (already imperial) |
| `Elevation Gain` | Feet |
| `Average Heart Rate` | bpm, not always present |
| `Max Heart Rate` | bpm, not always present |
| `Calories` | kcal |
| `Relative Effort` | Strava's effort score, not always present |
| `Activity Gear` | Shoe/gear name (e.g. "Altra Lone Peak 7") |
| `Dirt Distance` | Miles of trail/unpaved surface |
| `Grade Adjusted Distance` | Strava's effort-adjusted mileage |
| `Media` | Photo filename if attached |
| `Activity Private Note` | Private notes — display only to athlete |

### Gear on File
| Shoe | Activities |
|------|-----------|
| Altra Lone Peak 7 | 64 runs |
| Altra Timp 5 | 7 runs |

### Data Notes
- Workouts (CrossFit/HIIT) logged via Strava have no distance — they carry `Moving Time`, `Average Heart Rate`, and `Calories`
- Heart rate data is sparse — don't assume it's present
- Distance is in miles (imperial) — consistent with myWOD data
- `Media` field contains a relative filename when a photo was attached to the activity
- Strava's `Activity Description` field often contains WOD details typed by Robby (e.g. Murph breakdown, EMOM structure) — worth surfacing prominently on workout cards

### V2 — Live Strava Integration
- Replace static JSON export with Strava API OAuth connection
- Pull new activities automatically on login
- Planned: pace/distance trends, mileage calendar, overlay with WOD training load

---

## Navigation Structure

| Tab | Contents |
|-----|----------|
| **Train** | Activity feed (WODs + Runs + Lifts, oldest first). Tabs for CrossFit / Run. Hero WOD library lives inside Train. |
| **Progress** | PR charts, lift progression over time, workout frequency, training load trends. V2: AI-assisted training suggestions. |
| **Me** | Athlete profile card, pinned PRs, box affiliation, stats (hours logged, movements completed), theme toggle, settings. |

**Logging:** Floating action button (or equivalent) accessible from any screen. Prompts: WOD / Lift / Run.

---

## Data Files

| File | Description |
|------|-------------|
| `mywod_data.json` | Cleaned export of all myWOD data — WODs + lift sessions |
| `strava_activities.json` | Cleaned Strava export — 108 activities, Aug 2024–May 2026 |
| `crossfit-hero-wods.json` | 74 Hero WODs from crossfit.com |
| `crossfit-hero-wods-alpha.md` | Same 74 Hero WODs in markdown |
| `Shepherd-color-variables.md` | Full color token reference |

---

## Notes for Claude Code

- **Don't design — implement.** UI decisions belong to Robby. Follow Figma specs.
- **Use the Shepherd color palette** via CSS variables. No raw hex values in components.
- **Theme toggle:** default to `prefers-color-scheme`, user override stored in `localStorage` as `theme`. Set `data-theme` on `<html>` before first paint to avoid flash. See Theme Strategy above.
- **Join MovementSessions correctly** — both `foreignMovementClientID` AND `foreignMovementRecordID` required.
- **Score types vary** — "For Time" scores are `MM:SS`, "For Rounds" are `N+reps`, "For Repetitions" are integers. Handle all three display formats.
- **PR and Rx are separate flags** — display independently.
- **Data is imperial** (lbs, miles). No unit conversion needed for V1.
- **Activity feed sorted oldest → newest** — earliest entry at top.
- **Strava Workout type ≠ CrossFit WOD** — Strava "Workout" activities are gym/HIIT sessions logged via the Strava app. They overlap with but are separate from the myWOD log. Don't conflate the two datasets without matching on date + name.
- **Heart rate and effort data are sparse** — always null-check before displaying.
- Architecture should accommodate V2 live Strava API replacing the static JSON export.
