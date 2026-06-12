# CLAUDE.md — Project Context

This file is the source of truth for Claude Code and any AI assistant working on this project. Read it fully before writing any code.

---

## Project Overview

A personal CrossFit + running performance tracker for **Robby Myers** — designer, CrossFitter, trail runner. Built to replace the aging myWOD app with something modern, personal, and eventually Strava-connected.

**Stack path:** Figma (design) → Claude Code → GitHub → Vercel  
**Design authority:** Robby owns the design. Claude Code implements it — don't invent UI. Follow the Figma designs.

### V1 Scope
- Events page: unified, chronological feed of all CrossFit workouts and runs (add/edit/delete any event)
- View all past lift sessions + PRs by movement
- Log new completed WODs and runs
- Log new lift sessions
- Hero WOD reference library (74 workouts)
- Progress page: calendar showing workout/run days + draggable data widgets (VO2 Max, PR Highlights, Run Highlights)

### V2 (future)
- Strava integration (running data via Webhook Events API)
- AI-powered suggestions / goal setting

---

## Design System — Shepherd Color Palette

### Theme Strategy
- Default: `prefers-color-scheme` (system setting)
- User override: stored in `localStorage`
- Applied via `data-theme` attribute on `<html>` before first paint (prevents flash)
- **Black/White ramps invert between dark and light modes**
- **Green, Pink, Purple, and Blue accent ramps also invert between modes**

### Token Naming Convention
Use CSS variable names consistently. **Do not use hardcoded hex values in components.**

Each token maps to a dark-mode value and a light-mode value. Apply via `data-theme="dark"` / `data-theme="light"` on `<html>`.

---

### Black
| Variable              | Dark Mode  | Light Mode |
|-----------------------|------------|------------|
| `--color-black`       | `#171717`  | `#EEEEEE`  |
| `--color-black-600`   | `#000000`  | `#FFFFFF`  |
| `--color-black-500`   | `#232524`  | `#FCFCFC`  |
| `--color-black-400`   | `#454545`  | `#979797`  |
| `--color-black-300`   | `#747474`  | `#656565`  |
| `--color-black-200`   | `#A2A2A2`  | `#454545`  |

### White
| Variable              | Dark Mode  | Light Mode |
|-----------------------|------------|------------|
| `--color-white`       | `#EEEEEE`  | `#171717`  |
| `--color-white-offwhite` | `#FAF3E1` | `#171717` |
| `--color-white-800`   | `#656565`  | `#454545`  |
| `--color-white-700`   | `#979797`  | `#747474`  |
| `--color-white-600`   | `#CACACA`  | `#A2A2A2`  |

### Green (primary accent)
| Variable              | Dark Mode  | Light Mode |
|-----------------------|------------|------------|
| `--color-green`       | `#BBD87A`  | `#BBD87A`  |
| `--color-green-800`   | `#4B5631`  | `#E4EFCA`  |
| `--color-green-700`   | `#708249`  | `#D6E8AF`  |
| `--color-green-600`   | `#96AD62`  | `#C9E095`  |
| `--color-green-400`   | `#C9E095`  | `#96AD62`  |
| `--color-green-300`   | `#D6E8AF`  | `#708249`  |
| `--color-green-200`   | `#E4EFCA`  | `#4B5631`  |
| `--color-green-alt`   | `#03E995`  | `#015637`  |

### Pink
| Variable              | Dark Mode  | Light Mode |
|-----------------------|------------|------------|
| `--color-pink`        | `#DB4E90`  | `#DB4E90`  |
| `--color-pink-800`    | `#581F3A`  | `#F1B8D3`  |
| `--color-pink-700`    | `#832F56`  | `#E995BC`  |
| `--color-pink-600`    | `#AF3E73`  | `#E271A6`  |
| `--color-pink-400`    | `#E271A6`  | `#AF3E73`  |
| `--color-pink-300`    | `#E995BC`  | `#832F56`  |
| `--color-pink-200`    | `#F1B8D3`  | `#581F3A`  |
| `--color-pink-alt`    | `#FD3B60`  | `#A20220`  |

### Purple
| Variable              | Dark Mode  | Light Mode |
|-----------------------|------------|------------|
| `--color-purple`      | `#7A6AB3`  | `#7A6AB3`  |
| `--color-purple-800`  | `#312A48`  | `#CAC3E1`  |
| `--color-purple-700`  | `#49406B`  | `#AFA6D1`  |
| `--color-purple-600`  | `#62558F`  | `#9588C2`  |
| `--color-purple-400`  | `#9588C2`  | `#62558F`  |
| `--color-purple-300`  | `#AFA6D1`  | `#49406B`  |
| `--color-purple-200`  | `#CAC3E1`  | `#312A48`  |

### Blue
| Variable              | Dark Mode  | Light Mode |
|-----------------------|------------|------------|
| `--color-blue`        | `#6A90FF`  | `#6A90FF`  |
| `--color-blue-800`    | `#2A3A66`  | `#AFBEEB`  |
| `--color-blue-700`    | `#405699`  | `#98AFF1`  |
| `--color-blue-600`    | `#5573CC`  | `#819FF8`  |
| `--color-blue-400`    | `#819FF8`  | `#5573CC`  |
| `--color-blue-300`    | `#98AFF1`  | `#405699`  |
| `--color-blue-200`    | `#AFBEEB`  | `#2A3A66`  |

---

## Typography

- **Display / Headers:** Futura Condensed Bold
- **Body:** SF Pro
- **Scale:** 1.375 ratio from 21px base

---

## Navigation

Four tabs: **Events**, **Train**, **Progress**, **Account**

- Four tabs was the deliberate choice (three felt unbalanced)
- **Events** = unified activity log (CrossFit + runs), chronological
- **Train** = reference tools (Hero WOD library, etc.)
- **Progress** = calendar + data widgets (VO2 Max, PR Highlights, Run Highlights)
- **Account** = profile + settings
- Floating log action for new entries (design TBD in Figma)

### Train Page — Stopwatch Filter
The Train page has a stopwatch icon that toggles a filtered view. When active, it shows **only the movements and WODs that appear in the athlete's actual log history** — i.e. entries present in `mywod_data.json` (both `MyWODs` and `MovementSessions`).

- **Default state (stopwatch off):** full reference library — all Hero WODs + all tracked movements
- **Filtered state (stopwatch on):** only logged WODs (e.g. Fran, Murph, Cindy) and only movements the athlete has a session for (e.g. Back Squat, Clean & Jerk) — nothing they've never done
- The filter is a UI-only toggle, no network request. Derive the logged set at load time by cross-referencing the reference library against the log data
- Filter state does not need to persist between sessions

---

## Athlete Profile

Extracted from `data.mywod` (SQLite, exported May 2026):

- **Email:** robby.myers@gmail.com
- **Box:** Unaffiliated
- **Units:** Imperial (lbs)
- **Data range:** January 2020 – May 2026

---

## Data Architecture — Events

The Events page is the **unified chronological feed** of all activity. It combines two distinct activity types:

### Activity Types
| Type | Source | Display |
|------|--------|---------|
| `crossfit` | myWOD (`MyWODs` table) | WOD name, score, PR/Rx flags |
| `run` | Strava CSV / Strava Webhook (V2) | Distance, duration, pace, route |

### Unified Event Schema
Each event in the feed, regardless of type, conforms to this shape:

```json
{
  "id": "string",
  "type": "crossfit" | "run",
  "date": "YYYY-MM-DD",
  "title": "string",
  "source": "mywod" | "strava" | "manual",

  // CrossFit-specific (type === "crossfit")
  "scoreType": "For Time" | "For Rounds" | "For Repetitions",
  "score": "string",
  "personalRecord": true | false,
  "asPrescribed": true | false,
  "description": "string",
  "notes": "string",

  // Run-specific (type === "run")
  "distance_miles": number,
  "duration_seconds": number,
  "pace_per_mile": "string",
  "elevation_gain_ft": number,
  "route_name": "string",
  "gpx_file": "string | null"
}
```

### CRUD Requirements
- **Add** new CrossFit events or run events manually
- **Edit** any event (all fields)
- **Delete** any event (with confirmation)
- Events must re-sort by date after any add/edit

---

## Data Architecture — Progress Page

### Calendar
- Shows all days that have at least one event
- Crossfit days and run days use distinct visual indicators (colors or icons — TBD in Figma)
- Calendar day indicators are **derived from the Events feed** — same source of truth, no separate data store

### Draggable Widgets
The Progress page has three data widgets that can be reordered by the user:

| Widget | Content |
|--------|---------|
| VO2 Max | Apple Health VO2 Max data (see import note below) |
| PR Highlights | Best lifts and benchmark WOD PRs from myWOD |
| Run Highlights | Key running stats from Strava data |

**Drag behavior:** User can long-press and drag any widget to reorder. Order persists in `localStorage` (key: `progress_widget_order`). Default order: `["vo2max", "pr_highlights", "run_highlights"]`.

Implementation: use a drag-and-drop library (e.g. `@dnd-kit/core`) or native HTML5 drag API. The other two widgets should fluidly reflow when one is dragged.

### VO2 Max Data Source
VO2 Max is exported from Apple Health. Until Supabase is wired up, this is loaded from a static JSON file (`vo2max_data.json`). Format:

```json
[
  { "date": "YYYY-MM-DD", "value": 52.4, "source": "iPhone" }
]
```

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
| `vo2max_data.json` | Apple Health VO2 Max export (static until Supabase) |

---

## Upcoming Integrations

### Strava (V2)
- Running data (trail runs + road runs)
- Planned: Strava Webhook Events API for auto-syncing new activities
- GPX/FIT files from bulk export needed for route map visualization
- Primary shoe: Altra Lone Peak 7

### Supabase (backend)
- Planned backend to replace static JSON
- Will support live logging + Strava webhook sync

---

## Notes for Claude Code

- **Don't design — implement.** UI decisions belong to Robby. Follow Figma specs.
- **Use the Shepherd color palette** via CSS variables. No raw hex values in components.
- **Respect dark/light mode token inversion** — accent ramps flip. Use the theme-aware variables, not hardcoded light or dark values.
- **Join MovementSessions correctly** — both `foreignMovementClientID` AND `foreignMovementRecordID` required.
- **Score types vary** — "For Time" scores are `MM:SS`, "For Rounds" are `N+reps`, "For Repetitions" are integers. Handle all three display formats.
- **PR and Rx are separate flags** — display independently.
- **Data is imperial** (lbs). No unit conversion needed for V1.
- **Events feed is the single source of truth** for both the Events list and the Progress calendar. Don't maintain separate data stores for each.
- **Widget order persists** in `localStorage` under key `progress_widget_order`.
- Keep Strava hooks in mind architecturally — the data model must accommodate future `run` activity types beyond CrossFit WODs.
