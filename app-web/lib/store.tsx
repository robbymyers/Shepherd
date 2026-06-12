"use client";

import {
  createContext, useContext, useEffect, useMemo, useState, useCallback,
} from "react";
import type {
  SeedData, SportEvent, Movement, MovementSession, Wod, WodScore,
  ProgressCardId,
} from "./types";

const DATA_KEY = "shepherd:data:v1";
const ORDER_KEY = "shepherd:progressOrder:v1";
const THEME_KEY = "theme";

type Theme = "dark" | "light";

interface Persisted {
  events: SportEvent[];
  movements: Movement[];
  wods: Wod[];
}

interface StoreValue extends SeedData {
  ready: boolean;
  theme: Theme;
  toggleTheme: () => void;
  progressOrder: ProgressCardId[];
  setProgressOrder: (o: ProgressCardId[]) => void;
  // events
  addEvent: (e: Omit<SportEvent, "id" | "source">) => string;
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

function recomputeBest(m: Movement): Movement {
  const weights = m.sessions.map((s) => s.weight).filter((w): w is number => !!w);
  const best = weights.length ? Math.max(...weights) : null;
  const bestDate = best != null
    ? m.sessions.find((s) => s.weight === best)?.date ?? null
    : null;
  return { ...m, best, bestDate };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [seed, setSeed] = useState<SeedData | null>(null);
  const [data, setData] = useState<Persisted | null>(null);
  const [progressOrder, setOrderState] = useState<ProgressCardId[]>(DEFAULT_ORDER);
  const [theme, setTheme] = useState<Theme>("dark");

  // ---- bootstrap ----
  useEffect(() => {
    const t = (localStorage.getItem(THEME_KEY) as Theme) ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);

    const savedOrder = localStorage.getItem(ORDER_KEY);
    if (savedOrder) {
      try { setOrderState(JSON.parse(savedOrder)); } catch {}
    }

    fetch("/data/seed.json")
      .then((r) => r.json())
      .then((s: SeedData) => {
        setSeed(s);
        const saved = localStorage.getItem(DATA_KEY);
        if (saved) {
          try {
            setData(JSON.parse(saved));
            return;
          } catch {}
        }
        setData({ events: s.events, movements: s.movements, wods: s.wods });
      });
  }, []);

  // ---- persist ----
  useEffect(() => {
    if (data) localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);

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

  const addEvent: StoreValue["addEvent"] = useCallback((e) => {
    const id = `manual-${Date.now()}`;
    setData((d) => d && { ...d, events: [...d.events, { ...e, id, source: "manual" }] });
    return id;
  }, []);

  const updateEvent: StoreValue["updateEvent"] = useCallback((id, patch) => {
    setData((d) => d && {
      ...d,
      events: d.events.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)),
    });
  }, []);

  const deleteEvent: StoreValue["deleteEvent"] = useCallback((id) => {
    setData((d) => d && { ...d, events: d.events.filter((ev) => ev.id !== id) });
  }, []);

  const addSession: StoreValue["addSession"] = useCallback((movementId, s) => {
    setData((d) => d && {
      ...d,
      movements: d.movements.map((m) => {
        if (m.id !== movementId) return m;
        const sessions = [s, ...m.sessions].sort((a, b) => (a.date < b.date ? 1 : -1));
        return recomputeBest({ ...m, sessions });
      }),
    });
  }, []);

  const addScore: StoreValue["addScore"] = useCallback((wodId, s) => {
    setData((d) => d && {
      ...d,
      wods: d.wods.map((w) => {
        if (w.id !== wodId) return w;
        const scores = [s, ...w.scores].sort((a, b) => (a.date < b.date ? 1 : -1));
        return { ...w, scores };
      }),
    });
  }, []);

  const value = useMemo<StoreValue | null>(() => {
    if (!seed || !data) return null;
    return {
      ...seed,
      events: data.events,
      movements: data.movements,
      wods: data.wods,
      ready: true,
      theme,
      toggleTheme,
      progressOrder,
      setProgressOrder,
      addEvent,
      updateEvent,
      deleteEvent,
      getEvent: (id) => data.events.find((e) => e.id === id),
      addSession,
      addScore,
    };
  }, [seed, data, theme, toggleTheme, progressOrder, setProgressOrder,
      addEvent, updateEvent, deleteEvent, addSession, addScore]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const EMPTY: StoreValue = {
  athlete: { name: "Rob Myers", box: "CrossFit Ridge City", location: "Jonesboro, AR", loggedEvents: 0 },
  events: [],
  movements: [],
  wods: [],
  vo2max: [],
  runHighlights: [],
  prHighlights: [],
  ready: false,
  theme: "dark",
  toggleTheme: () => {},
  progressOrder: DEFAULT_ORDER,
  setProgressOrder: () => {},
  addEvent: () => "",
  updateEvent: () => {},
  deleteEvent: () => {},
  getEvent: () => undefined,
  addSession: () => {},
  addScore: () => {},
};

export function useStore(): StoreValue {
  return useContext(Ctx) ?? EMPTY;
}
