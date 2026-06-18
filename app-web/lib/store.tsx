"use client";

import {
  createContext, useContext, useEffect, useMemo, useState, useCallback,
} from "react";
import type {
  SeedData, SportEvent, Movement, MovementSession, Wod, WodScore,
  ProgressCardId, Athlete, Vo2Point, Highlight,
} from "./types";
import { supabase, supabaseConfigured } from "./supabase";

const ORDER_KEY = "shepherd:progressOrder:v1";
const THEME_KEY = "theme";

type Theme = "dark" | "light";

interface StoreValue extends SeedData {
  ready: boolean;
  theme: Theme;
  toggleTheme: () => void;
  progressOrder: ProgressCardId[];
  setProgressOrder: (o: ProgressCardId[]) => void;
  // auth (public read, owner-only write)
  signedIn: boolean;
  authEmail: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  changePassword: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  // events
  addEvent: (e: Omit<SportEvent, "id" | "source">) => void;
  updateEvent: (id: string, patch: Partial<SportEvent>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => SportEvent | undefined;
  // movement sessions
  addSession: (movementId: string, s: MovementSession) => void;
  // wod scores
  addScore: (wodId: string, s: WodScore) => void;
}

const Ctx = createContext<StoreValue | null>(null);
const DEFAULT_ORDER: ProgressCardId[] = ["vo2", "pr", "runs"];

/* ---------------- row <-> app shape mapping ---------------- */

type EventRow = Record<string, unknown>;

function rowToEvent(r: EventRow): SportEvent {
  return {
    id: r.id as string,
    source: (r.source as SportEvent["source"]) ?? "manual",
    kind: r.kind as SportEvent["kind"],
    name: r.name as string,
    date: r.date as string,
    description: (r.description as string) ?? null,
    location: (r.location as string) ?? null,
    gear: (r.gear as string) ?? null,
    movingTime: (r.moving_time as string) ?? null,
    movingSeconds: (r.moving_seconds as number) ?? null,
    distance: (r.distance as number) ?? null,
    elevationGain: (r.elevation_gain as number) ?? null,
    calories: (r.calories as number) ?? null,
    avgHeartRate: (r.avg_heart_rate as number) ?? null,
    maxHeartRate: (r.max_heart_rate as number) ?? null,
    pace: (r.pace as string) ?? null,
    scoreType: (r.score_type as string) ?? null,
    score: (r.score as string) ?? null,
    pr: (r.pr as boolean) ?? undefined,
    rx: (r.rx as boolean) ?? undefined,
    route: (r.route as [number, number][]) ?? undefined,
    splits: (r.splits as SportEvent["splits"]) ?? undefined,
  };
}

function eventToRow(e: Partial<SportEvent>): EventRow {
  const row: EventRow = {};
  const set = (k: string, v: unknown) => { if (v !== undefined) row[k] = v; };
  set("id", e.id); set("kind", e.kind); set("source", e.source);
  set("name", e.name); set("date", e.date); set("description", e.description);
  set("location", e.location); set("gear", e.gear);
  set("moving_time", e.movingTime); set("moving_seconds", e.movingSeconds);
  set("distance", e.distance); set("elevation_gain", e.elevationGain);
  set("calories", e.calories); set("avg_heart_rate", e.avgHeartRate);
  set("max_heart_rate", e.maxHeartRate); set("pace", e.pace);
  set("score_type", e.scoreType); set("score", e.score);
  set("pr", e.pr ?? null); set("rx", e.rx ?? null);
  set("route", e.route ?? null); set("splits", e.splits ?? null);
  return row;
}

function recomputeBest(m: Movement): Movement {
  const weights = m.sessions.map((s) => s.weight).filter((w): w is number => !!w);
  const best = weights.length ? Math.max(...weights) : null;
  const bestDate = best != null
    ? m.sessions.find((s) => s.weight === best)?.date ?? null
    : null;
  return { ...m, best, bestDate };
}

/** Assemble movements + sessions + wods + scores from flat DB rows. */
function assembleMovements(
  movements: { id: string; name: string }[],
  sessions: EventRow[],
): Movement[] {
  const byId = new Map<string, Movement>();
  for (const m of movements) byId.set(m.id, { id: m.id, name: m.name, best: null, bestDate: null, sessions: [] });
  for (const s of sessions) {
    const mv = byId.get(s.movement_id as string);
    if (!mv) continue;
    mv.sessions.push({
      date: s.date as string,
      weight: (s.weight as number) ?? null,
      reps: (s.reps as string) ?? null,
      sets: (s.sets as string) ?? null,
      notes: (s.notes as string) ?? null,
      oneRepMax: (s.one_rep_max as boolean) ?? false,
    });
  }
  const out: Movement[] = [];
  for (const m of byId.values()) {
    m.sessions.sort((a, b) => (a.date < b.date ? 1 : -1));
    out.push(recomputeBest(m));
  }
  return out.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

function assembleWods(wods: EventRow[], scores: EventRow[]): Wod[] {
  const byId = new Map<string, Wod>();
  for (const w of wods) {
    byId.set(w.id as string, {
      id: w.id as string,
      title: w.title as string,
      type: (w.type as string) ?? "",
      category: (w.category as Wod["category"]) ?? "hero",
      description: (w.description as string) ?? null,
      weight: (w.weight as string) ?? null,
      logged: false,
      scores: [],
    });
  }
  for (const s of scores) {
    const w = byId.get(s.wod_id as string);
    if (!w) continue;
    w.scores.push({
      date: s.date as string,
      score: (s.score as string) ?? "",
      scoreType: (s.score_type as string) ?? "",
      pr: (s.pr as boolean) ?? false,
      rx: (s.rx as boolean) ?? false,
      notes: (s.notes as string) ?? null,
    });
  }
  const out: Wod[] = [];
  for (const w of byId.values()) {
    w.scores.sort((a, b) => (a.date < b.date ? 1 : -1));
    w.logged = w.scores.length > 0;
    out.push(w);
  }
  return out.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [athlete, setAthlete] = useState<Athlete>(EMPTY.athlete);
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [wods, setWods] = useState<Wod[]>([]);
  const [vo2max, setVo2] = useState<Vo2Point[]>([]);
  const [runHighlights, setRunHL] = useState<Highlight[]>([]);
  const [prHighlights, setPrHL] = useState<Highlight[]>([]);
  const [ready, setReady] = useState(false);
  const [progressOrder, setOrderState] = useState<ProgressCardId[]>(DEFAULT_ORDER);
  const [theme, setTheme] = useState<Theme>("dark");
  const [authEmail, setAuthEmail] = useState<string | null>(null);

  // ---- bootstrap: theme + order + data ----
  useEffect(() => {
    const t = (localStorage.getItem(THEME_KEY) as Theme) ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);

    const savedOrder = localStorage.getItem(ORDER_KEY);
    if (savedOrder) { try { setOrderState(JSON.parse(savedOrder)); } catch {} }

    // auth session
    supabase.auth.getSession().then(({ data }) => setAuthEmail(data.session?.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthEmail(session?.user?.email ?? null);
    });

    (async () => {
      // analytics (vo2/highlights/athlete) stay in the static seed; live tables drive the rest
      const seedP = fetch("/data/seed.json").then((r) => r.json()).catch(() => null) as Promise<SeedData | null>;

      let loadedFromDb = false;
      if (supabaseConfigured) {
        const [ev, mv, ms, wd, ws] = await Promise.all([
          supabase.from("events").select("*"),
          supabase.from("movements").select("*"),
          supabase.from("movement_sessions").select("*"),
          supabase.from("wods").select("*"),
          supabase.from("wod_scores").select("*"),
        ]);
        if (!ev.error && !mv.error && !ms.error && !wd.error && !ws.error) {
          setEvents((ev.data ?? []).map(rowToEvent));
          setMovements(assembleMovements(mv.data ?? [], ms.data ?? []));
          setWods(assembleWods(wd.data ?? [], ws.data ?? []));
          loadedFromDb = true;
        }
      }

      const seed = await seedP;
      if (seed) {
        setAthlete({ ...seed.athlete, loggedEvents: seed.events.length });
        setVo2(seed.vo2max);
        setRunHL(seed.runHighlights);
        setPrHL(seed.prHighlights);
        if (!loadedFromDb) {
          // offline / not configured → static fallback so the app still renders
          setEvents(seed.events);
          setMovements(seed.movements);
          setWods(seed.wods);
        }
      }
      setReady(true);
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

  const signedIn = !!authEmail;

  // ---- theme / order ----
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);
  const setProgressOrder = useCallback((o: ProgressCardId[]) => {
    setOrderState(o);
    localStorage.setItem(ORDER_KEY, JSON.stringify(o));
  }, []);

  // ---- auth ----
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(), password,
    });
    return error?.message ?? null;
  }, []);
  const changePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return error?.message ?? null;
  }, []);
  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  // ---- events (optimistic write-through) ----
  const addEvent: StoreValue["addEvent"] = useCallback((e) => {
    const id = `manual-${crypto.randomUUID()}`;
    const optimistic: SportEvent = { ...e, id, source: "manual" };
    setEvents((cur) => [optimistic, ...cur]);
    supabase.from("events").insert(eventToRow(optimistic)).then(({ error }) => {
      if (error) { setEvents((cur) => cur.filter((x) => x.id !== id)); alert(`Couldn't save: ${error.message}`); }
    });
  }, []);

  const updateEvent: StoreValue["updateEvent"] = useCallback((id, patch) => {
    let prev: SportEvent | undefined;
    setEvents((cur) => cur.map((x) => { if (x.id === id) { prev = x; return { ...x, ...patch }; } return x; }));
    supabase.from("events").update(eventToRow(patch)).eq("id", id).then(({ error }) => {
      if (error && prev) { setEvents((cur) => cur.map((x) => (x.id === id ? prev! : x))); alert(`Couldn't update: ${error.message}`); }
    });
  }, []);

  const deleteEvent: StoreValue["deleteEvent"] = useCallback((id) => {
    let removed: SportEvent | undefined;
    setEvents((cur) => { removed = cur.find((x) => x.id === id); return cur.filter((x) => x.id !== id); });
    supabase.from("events").delete().eq("id", id).then(({ error }) => {
      if (error && removed) { setEvents((cur) => [removed!, ...cur]); alert(`Couldn't delete: ${error.message}`); }
    });
  }, []);

  // ---- movement sessions ----
  const addSession: StoreValue["addSession"] = useCallback((movementId, s) => {
    setMovements((cur) => cur.map((m) => {
      if (m.id !== movementId) return m;
      const sessions = [s, ...m.sessions].sort((a, b) => (a.date < b.date ? 1 : -1));
      return recomputeBest({ ...m, sessions });
    }));
    supabase.from("movement_sessions").insert({
      movement_id: movementId, date: s.date, weight: s.weight,
      reps: s.reps ?? null, sets: s.sets ?? null, notes: s.notes ?? null,
      one_rep_max: s.oneRepMax ?? false,
    }).then(({ error }) => { if (error) alert(`Couldn't save session: ${error.message}`); });
  }, []);

  // ---- wod scores ----
  const addScore: StoreValue["addScore"] = useCallback((wodId, s) => {
    setWods((cur) => cur.map((w) => {
      if (w.id !== wodId) return w;
      const scores = [s, ...w.scores].sort((a, b) => (a.date < b.date ? 1 : -1));
      return { ...w, scores, logged: true };
    }));
    supabase.from("wod_scores").insert({
      wod_id: wodId, date: s.date, score: s.score, score_type: s.scoreType,
      pr: s.pr, rx: s.rx, notes: s.notes ?? null,
    }).then(({ error }) => { if (error) alert(`Couldn't save score: ${error.message}`); });
  }, []);

  const value = useMemo<StoreValue>(() => ({
    athlete, events, movements, wods, vo2max, runHighlights, prHighlights,
    ready, theme, toggleTheme, progressOrder, setProgressOrder,
    signedIn, authEmail, signIn, changePassword, signOut,
    addEvent, updateEvent, deleteEvent,
    getEvent: (id) => events.find((e) => e.id === id),
    addSession, addScore,
  }), [athlete, events, movements, wods, vo2max, runHighlights, prHighlights,
    ready, theme, toggleTheme, progressOrder, setProgressOrder,
    signedIn, authEmail, signIn, changePassword, signOut,
    addEvent, updateEvent, deleteEvent, addSession, addScore]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const EMPTY: StoreValue = {
  athlete: { name: "Rob Myers", box: "CrossFit Ridge City", location: "Jonesboro, AR", loggedEvents: 0 },
  events: [], movements: [], wods: [], vo2max: [], runHighlights: [], prHighlights: [],
  ready: false, theme: "dark", toggleTheme: () => {},
  progressOrder: DEFAULT_ORDER, setProgressOrder: () => {},
  signedIn: false, authEmail: null,
  signIn: async () => null, changePassword: async () => null, signOut: async () => {},
  addEvent: () => {}, updateEvent: () => {}, deleteEvent: () => {},
  getEvent: () => undefined, addSession: () => {}, addScore: () => {},
};

export function useStore(): StoreValue {
  return useContext(Ctx) ?? EMPTY;
}
