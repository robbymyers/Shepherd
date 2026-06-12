#!/usr/bin/env python3
"""Extract Shepherd seed data from Data/ into the Next.js app's public/data/seed.json.

Sources:
  - Data/data.mywod            (SQLite: Movement, MovementSessions, MyWODs, Athlete)
  - Data/StravaData/activities.csv  (108 activities: Run / Workout / Walk)
  - Data/vo2max_data.json      (Apple Watch VO2 max readings)

Run from the project root:  python3 scripts/extract.py
"""
import csv, json, math, sqlite3, os, sys
import xml.etree.ElementTree as ET
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "Data")
OUT_DIR = os.path.join(ROOT, "app-web", "public", "data")
M_PER_MILE = 1609.34
M_TO_FT = 3.28084
GPX_NS = "{http://www.topografix.com/GPX/1/1}"
MAX_ROUTE_POINTS = 150

# ---- helpers ---------------------------------------------------------------

def parse_strava_date(s):
    # "May 26, 2026, 5:35:21 PM" -> ISO 8601
    return datetime.strptime(s.strip(), "%b %d, %Y, %I:%M:%S %p").isoformat()

def fnum(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None

def clock(seconds):
    if seconds is None:
        return None
    seconds = int(round(seconds))
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"

# ---- GPX -> route polyline + mile splits -----------------------------------

def parse_gpx_points(path):
    """[(lat, lon, epoch_seconds|None), ...] from a GPX track."""
    try:
        root = ET.parse(path).getroot()
    except (ET.ParseError, OSError):
        return []
    pts = []
    for tp in root.iter(GPX_NS + "trkpt"):
        try:
            lat, lon = float(tp.get("lat")), float(tp.get("lon"))
        except (TypeError, ValueError):
            continue
        ts = None
        t = tp.find(GPX_NS + "time")
        if t is not None and t.text:
            try:
                ts = datetime.strptime(t.text.strip(), "%Y-%m-%dT%H:%M:%SZ").timestamp()
            except ValueError:
                pass
        pts.append((lat, lon, ts))
    return pts


def haversine_miles(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = (math.sin((la2 - la1) / 2) ** 2
         + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2)
    return 2 * 3958.8 * math.asin(math.sqrt(h))


def route_and_splits(path):
    """Downsampled [lat,lng] polyline + per-mile splits (elapsed-time pace)."""
    pts = parse_gpx_points(path)
    if len(pts) < 2:
        return None, None

    stride = max(1, len(pts) // MAX_ROUTE_POINTS)
    route = [[round(p[0], 5), round(p[1], 5)] for p in pts[::stride]]
    tail = [round(pts[-1][0], 5), round(pts[-1][1], 5)]
    if route[-1] != tail:
        route.append(tail)

    splits = []
    cum = 0.0
    mile = 1
    mile_start_t = pts[0][2]
    for i in range(1, len(pts)):
        prev, cur = pts[i - 1], pts[i]
        cum_prev = cum
        cum += haversine_miles(prev, cur)
        if cur[2] is None or mile_start_t is None:
            continue
        if cum >= mile and cum > cum_prev:
            frac = (mile - cum_prev) / (cum - cum_prev)
            t_prev = prev[2] if prev[2] is not None else cur[2]
            boundary_t = t_prev + (cur[2] - t_prev) * frac
            splits.append({"mile": mile, "seconds": int(boundary_t - mile_start_t)})
            mile_start_t = boundary_t
            mile += 1
    partial = cum - (mile - 1)
    if partial >= 0.2 and pts[-1][2] is not None and mile_start_t is not None:
        secs = pts[-1][2] - mile_start_t
        if secs > 0:
            splits.append({"mile": mile, "seconds": int(secs / partial),
                           "partial": round(partial, 2)})
    for s in splits:
        s["pace"] = clock(s["seconds"])
    return route, (splits or None)

# ---- Strava activities -> events ------------------------------------------

def extract_events():
    path = os.path.join(DATA, "StravaData", "activities.csv")
    events = []
    with open(path, newline="") as f:
        rows = list(csv.reader(f))
    for r in rows[1:]:
        if len(r) < 35:
            continue
        atype = r[3]
        if atype not in ("Run", "Workout", "Walk"):
            continue
        moving = fnum(r[16])
        dist_m = fnum(r[17])
        elev_m = fnum(r[20])
        max_hr = fnum(r[30])
        avg_hr = fnum(r[31])
        cals = fnum(r[34])
        kind = {"Run": "run", "Workout": "workout", "Walk": "walk"}[atype]
        miles = round(dist_m / M_PER_MILE, 2) if dist_m else None
        ev = {
            "id": f"strava-{r[0]}",
            "source": "strava",
            "kind": kind,
            "name": r[2].strip() or ("Run" if kind == "run" else "Workout"),
            "date": parse_strava_date(r[1]),
            "description": r[4].strip() or None,
            "gear": r[11].strip() or None,
            "movingTime": clock(moving),
            "movingSeconds": int(moving) if moving else None,
            "distance": miles,
            "elevationGain": round(elev_m * M_TO_FT) if elev_m else None,
            "calories": round(cals) if cals else None,
            "avgHeartRate": round(avg_hr) if avg_hr else None,
            "maxHeartRate": round(max_hr) if max_hr else None,
        }
        if kind == "run" and miles and moving:
            pace = moving / miles  # sec per mile
            ev["pace"] = f"{int(pace)//60}:{int(pace)%60:02d}/mi"
        if kind == "run":
            gpx_rel = (r[12] or "").strip()
            if gpx_rel.endswith(".gpx"):
                gpx_path = os.path.join(DATA, "StravaData", gpx_rel)
                if os.path.exists(gpx_path):
                    route, splits = route_and_splits(gpx_path)
                    if route:
                        ev["route"] = route
                    if splits:
                        ev["splits"] = splits
        events.append(ev)
    events.sort(key=lambda e: e["date"])
    return events

# ---- myWOD: movements + sessions ------------------------------------------

def extract_movements(con):
    cur = con.cursor()
    cur.execute("SELECT primaryClientID, primaryRecordID, name FROM Movement WHERE deleted=0")
    movements = {}
    for cid, rid, name in cur.fetchall():
        movements[(cid, rid)] = {"id": "mv-" + slugify(name), "name": name, "sessions": []}
    cur.execute(
        "SELECT foreignMovementClientID, foreignMovementRecordID, date, "
        "measurementAValue, measurementB, sets, notes "
        "FROM MovementSessions WHERE deleted=0"
    )
    for fcid, frid, date, val, reps, sets, notes in cur.fetchall():
        key = (fcid, frid)
        if key not in movements:
            continue
        movements[key]["sessions"].append({
            "date": date,
            "weight": float(val) if val is not None else None,
            "reps": (reps or "").strip() or None,
            "sets": (sets or "").strip() or None,
            "notes": (notes or "").strip() or None,
        })
    out = []
    for m in movements.values():
        m["sessions"].sort(key=lambda s: s["date"], reverse=True)
        weights = [s["weight"] for s in m["sessions"] if s["weight"]]
        best = max(weights) if weights else None
        m["best"] = best
        m["bestDate"] = next((s["date"] for s in m["sessions"] if s["weight"] == best), None)
        out.append(m)  # keep unlogged movements too (sessions == []) for the library
    out.sort(key=lambda m: m["name"].lower())
    return out

# ---- myWOD: logged WODs (grouped by title) --------------------------------

def extract_wods(con):
    cur = con.cursor()
    cur.execute(
        "SELECT title, date, scoreType, score, personalRecord, asPrescribed, description, notes "
        "FROM MyWODs WHERE deleted=0 ORDER BY date DESC"
    )
    groups = {}
    for title, date, stype, score, pr, rx, desc, notes in cur.fetchall():
        g = groups.setdefault(title, {
            "id": "wod-" + slugify(title),
            "title": title,
            "scoreType": stype,
            "description": (desc or "").strip() or None,
            "scores": [],
        })
        if not g["description"] and desc:
            g["description"] = desc.strip()
        g["scores"].append({
            "date": date,
            "score": score,
            "scoreType": stype,
            "pr": bool(pr),
            "rx": bool(rx),
            "notes": (notes or "").strip() or None,
        })
    for g in groups.values():
        g["scores"].sort(key=lambda s: s["date"], reverse=True)
    return sorted(groups.values(), key=lambda g: g["scores"][0]["date"], reverse=True)


def slugify(name):
    return "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-")


def build_wod_library(logged, hero_path):
    """Merge the Hero WOD reference library with the athlete's logged WODs.
    Each entry carries a `logged` flag + any recorded scores so the Train
    stopwatch filter can show only logged workouts."""
    with open(hero_path) as f:
        heroes = json.load(f)["workouts"]

    by_title = {}
    for h in heroes:
        desc_lines = []
        if h.get("structure"):
            desc_lines.append(h["structure"] + ":")
        desc_lines += h.get("movements", [])
        by_title[h["name"].lower()] = {
            "id": "wod-" + slugify(h["name"]),
            "title": h["name"],
            "type": h.get("type", "For Time"),
            "category": "hero",
            "description": "\n".join(desc_lines) or None,
            "weight": (h.get("weight") or {}).get("male"),
            "scores": [],
            "logged": False,
        }

    GENERIC = {"for time", "rounds for time", "amrap", "for reps", "for rounds", "30s"}
    for w in logged:
        title = (w["title"] or "").strip()
        key = title.lower()
        # drop custom entries with empty/generic titles (not useful in a library)
        if key not in by_title and (len(title) < 2 or key in GENERIC
                                    or not any(c.isalpha() for c in title)):
            continue
        if key in by_title:
            by_title[key]["scores"] = w["scores"]
            by_title[key]["logged"] = True
            if not by_title[key]["description"]:
                by_title[key]["description"] = w["description"]
        else:
            by_title[key] = {
                "id": w["id"],
                "title": w["title"],
                "type": (w["scoreType"] or "For Time").rstrip(":"),
                "category": "benchmark",
                "description": w["description"],
                "weight": None,
                "scores": w["scores"],
                "logged": True,
            }
    return sorted(by_title.values(), key=lambda w: w["title"].lower())

# ---- run highlights: best 5K / 10K / 15K ----------------------------------

def run_highlights(events):
    targets = [("5K", 3.1), ("10K", 6.2), ("15K", 9.3)]
    runs = [e for e in events if e["kind"] == "run" and e.get("distance") and e.get("movingSeconds")]
    out = []
    for label, miles in targets:
        # runs that covered at least this distance, fastest pace wins
        eligible = [e for e in runs if e["distance"] >= miles - 0.15]
        if not eligible:
            continue
        best = min(eligible, key=lambda e: e["movingSeconds"] / e["distance"])
        secs = (best["movingSeconds"] / best["distance"]) * miles
        out.append({"label": label, "time": clock(secs), "date": best["date"]})
    return out

# ---- athlete --------------------------------------------------------------

def athlete(con, n_events):
    # The exported Athlete row has NULL name/box; use the display identity from
    # the Figma design + profile.csv (Robby Myers, Jonesboro AR).
    return {
        "name": "Rob Myers",
        "box": "CrossFit Ridge City",
        "location": "Jonesboro, AR",
        "loggedEvents": n_events,
    }


def pr_highlights(wods, movements):
    """Curated Progress > PR Highlights row (matches the Figma design):
    two benchmark WOD PRs followed by three lift PRs."""
    out = []

    def wod_pr(title):
        w = next((w for w in wods if w["title"] == title), None)
        if not w:
            return
        best = next((s for s in w["scores"] if s["pr"]), w["scores"][0])
        out.append({"label": title.upper(), "value": best["score"], "date": best["date"], "kind": "wod"})

    def lift_pr(name):
        m = next((m for m in movements if m["name"] == name), None)
        if not m or not m["best"]:
            return
        out.append({"label": name.upper(), "value": str(int(m["best"])), "date": m["bestDate"], "kind": "lift"})

    wod_pr("Fran")
    wod_pr("Murph")
    lift_pr("Clean & Jerk")
    lift_pr("Dead Lift")
    lift_pr("Front Squat")
    return out

# ---- main -----------------------------------------------------------------

def main():
    con = sqlite3.connect(os.path.join(DATA, "data.mywod"))
    events = extract_events()
    movements = extract_movements(con)
    logged_wods = extract_wods(con)
    wods = build_wod_library(logged_wods, os.path.join(DATA, "crossfit-hero-wods.json"))
    with open(os.path.join(DATA, "vo2max_data.json")) as f:
        vo2 = json.load(f)
    seed = {
        "athlete": athlete(con, len(events)),
        "events": events,
        "movements": movements,
        "wods": wods,
        "vo2max": [{"date": v["date"], "value": v["value"]} for v in vo2],
        "runHighlights": run_highlights(events),
        "prHighlights": pr_highlights(wods, movements),
    }
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "seed.json"), "w") as f:
        json.dump(seed, f, indent=2)
    logged_count = sum(1 for w in wods if w["logged"])
    print("events:", len(events), "| movements:", len(movements),
          f"(logged {sum(1 for m in movements if m['sessions'])})",
          "| wods:", len(wods), f"(logged {logged_count})", "| vo2:", len(vo2),
          "| runHL:", len(seed["runHighlights"]), "| prHL:", len(seed["prHighlights"]))
    print("wrote", os.path.join(OUT_DIR, "seed.json"))

if __name__ == "__main__":
    main()
