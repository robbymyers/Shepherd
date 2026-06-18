"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Back } from "./Icons";
import styles from "./Timers.module.css";

type Mode = "standard" | "countdown" | "interval" | "tabata" | "lap";

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: "standard", label: "Standard", desc: "Count up" },
  { id: "countdown", label: "Countdown", desc: "Time cap / AMRAP clock" },
  { id: "interval", label: "Interval", desc: "Work / rest rounds (EMOM)" },
  { id: "tabata", label: "Tabata", desc: "20s on · 10s off · 8 rounds" },
  { id: "lap", label: "Lap", desc: "Stopwatch with splits" },
];

/* short Web-Audio beep (created on demand so it works after a user gesture) */
function beep(freq = 880, ms = 160) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    o.start();
    o.stop(ctx.currentTime + ms / 1000);
    o.onended = () => ctx.close();
  } catch {
    /* audio not available — fail silently */
  }
}

function fmt(ms: number, cs = false): string {
  const t = Math.max(0, ms);
  const totalSec = Math.floor(t / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const head = h ? `${h}:${String(m).padStart(2, "0")}` : `${m}`;
  const base = `${head}:${String(s).padStart(2, "0")}`;
  if (!cs) return base;
  return `${base}.${String(Math.floor((t % 1000) / 10)).padStart(2, "0")}`;
}

/** rAF-driven elapsed-ms engine. */
function useStopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now() - elapsed;
    const loop = () => {
      setElapsed(performance.now() - startRef.current);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const reset = useCallback(() => { setRunning(false); setElapsed(0); }, []);
  return { running, setRunning, elapsed, setElapsed, reset };
}

export default function Timers({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode | null>(null);

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <button
          className={styles.back}
          onClick={() => (mode ? setMode(null) : onClose())}
          aria-label="Back"
        >
          <Back width={11} height={19} />
        </button>
        <span className={`display ${styles.topTitle}`}>
          {mode ? MODES.find((m) => m.id === mode)!.label : "Timers"}
        </span>
        <span className={styles.topSpacer} />
      </div>

      {!mode && (
        <div className={styles.menu}>
          {MODES.map((m) => (
            <button key={m.id} className={styles.option} onClick={() => setMode(m.id)}>
              <span className={`display ${styles.optLabel}`}>{m.label}</span>
              <span className={styles.optDesc}>{m.desc}</span>
            </button>
          ))}
        </div>
      )}

      {mode === "standard" && <Stopwatch />}
      {mode === "lap" && <Stopwatch laps />}
      {mode === "countdown" && <Countdown />}
      {mode === "interval" && <Rounds defaults={{ work: 60, rest: 0, rounds: 10 }} />}
      {mode === "tabata" && <Rounds defaults={{ work: 20, rest: 10, rounds: 8 }} tabata />}
    </div>
  );
}

/* ---------------- Standard / Lap ---------------- */
function Stopwatch({ laps = false }: { laps?: boolean }) {
  const { running, setRunning, elapsed, reset } = useStopwatch();
  const [splits, setSplits] = useState<number[]>([]);
  const lastRef = useRef(0);

  function lap() {
    const split = elapsed - lastRef.current;
    lastRef.current = elapsed;
    setSplits((s) => [split, ...s]);
  }
  function resetAll() { reset(); setSplits([]); lastRef.current = 0; }

  return (
    <div className={styles.stage}>
      <div className={`display num ${styles.clock}`}>{fmt(elapsed, true)}</div>
      <div className={styles.controls}>
        <button className={`${styles.ctrl} ${styles.ghost}`} onClick={resetAll}>Reset</button>
        <button
          className={`${styles.ctrl} ${running ? styles.stop : styles.start}`}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "Pause" : elapsed ? "Resume" : "Start"}
        </button>
        {laps && (
          <button className={`${styles.ctrl} ${styles.ghost}`} onClick={lap} disabled={!running}>
            Lap
          </button>
        )}
      </div>
      {laps && splits.length > 0 && (
        <div className={styles.laps}>
          {splits.map((s, i) => (
            <div key={i} className={styles.lapRow}>
              <span>Lap {splits.length - i}</span>
              <span className="display">{fmt(s, true)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Countdown ---------------- */
function Countdown() {
  const { running, setRunning, elapsed, reset } = useStopwatch();
  const [target, setTarget] = useState(10 * 60 * 1000); // 10:00 default
  const firedRef = useRef(false);
  const remaining = Math.max(0, target - elapsed);

  useEffect(() => {
    if (running && remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      setRunning(false);
      beep(660, 250); setTimeout(() => beep(660, 250), 300); setTimeout(() => beep(990, 400), 600);
    }
  }, [running, remaining, setRunning]);

  function bump(deltaSec: number) {
    if (running) return;
    setTarget((t) => Math.max(0, t + deltaSec * 1000));
  }
  function resetAll() { reset(); firedRef.current = false; }

  return (
    <div className={styles.stage}>
      <div className={`display num ${styles.clock} ${remaining === 0 ? styles.done : ""}`}>
        {fmt(remaining)}
      </div>
      {!running && elapsed === 0 && (
        <div className={styles.setRow}>
          {[-60, -10, 10, 60].map((d) => (
            <button key={d} className={styles.setBtn} onClick={() => bump(d)}>
              {d > 0 ? `+${d}s` : `${d}s`}
            </button>
          ))}
        </div>
      )}
      <div className={styles.controls}>
        <button className={`${styles.ctrl} ${styles.ghost}`} onClick={resetAll}>Reset</button>
        <button
          className={`${styles.ctrl} ${running ? styles.stop : styles.start}`}
          onClick={() => { if (target > 0) setRunning((r) => !r); }}
          disabled={target === 0}
        >
          {running ? "Pause" : elapsed ? "Resume" : "Start"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Interval / Tabata ---------------- */
function Rounds({
  defaults, tabata = false,
}: {
  defaults: { work: number; rest: number; rounds: number };
  tabata?: boolean;
}) {
  const { running, setRunning, elapsed, reset } = useStopwatch();
  const [cfg, setCfg] = useState(defaults);
  const phaseRef = useRef<string>("");

  const cycle = (cfg.work + cfg.rest) * 1000;
  const total = cycle * cfg.rounds;
  const done = elapsed >= total && total > 0;
  const within = total > 0 ? elapsed % cycle : 0;
  const round = Math.min(cfg.rounds, Math.floor(elapsed / cycle) + 1);
  const inWork = within < cfg.work * 1000;
  const phase = done ? "done" : inWork ? "work" : "rest";
  const phaseRemaining = done ? 0 : inWork ? cfg.work * 1000 - within : cycle - within;

  // beep on each phase transition + finish
  useEffect(() => {
    if (!running) return;
    const key = done ? "done" : `${round}-${phase}`;
    if (phaseRef.current && phaseRef.current !== key) {
      if (done) { beep(990, 450); }
      else beep(phase === "work" ? 880 : 520, 160);
    }
    phaseRef.current = key;
    if (done) setRunning(false);
  }, [round, phase, done, running, setRunning]);

  function resetAll() { reset(); phaseRef.current = ""; }
  function adj(field: "work" | "rest" | "rounds", delta: number) {
    if (running) return;
    setCfg((c) => ({ ...c, [field]: Math.max(field === "rounds" ? 1 : 0, c[field] + delta) }));
  }

  return (
    <div className={styles.stage}>
      <div className={styles.roundMeta}>
        <span className={`display num ${styles.roundNum}`}>
          {done ? "DONE" : `${round} / ${cfg.rounds}`}
        </span>
        {!done && (
          <span className={`${styles.phase} ${phase === "work" ? styles.work : styles.rest}`}>
            {cfg.rest === 0 ? "GO" : phase === "work" ? "WORK" : "REST"}
          </span>
        )}
      </div>
      <div className={`display num ${styles.clock} ${phase === "rest" ? styles.restClock : ""}`}>
        {fmt(phaseRemaining)}
      </div>

      {!running && elapsed === 0 && (
        <div className={styles.cfg}>
          {([["work", "Work"], ["rest", "Rest"], ["rounds", "Rounds"]] as [keyof typeof cfg, string][]).map(([k, label]) => (
            <div key={k} className={styles.cfgRow}>
              <span className={styles.cfgLabel}>{label}</span>
              <div className={styles.stepper}>
                <button onClick={() => adj(k, k === "rounds" ? -1 : -5)}>–</button>
                <span className="display">{k === "rounds" ? cfg[k] : `${cfg[k]}s`}</span>
                <button onClick={() => adj(k, k === "rounds" ? 1 : 5)}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.controls}>
        <button className={`${styles.ctrl} ${styles.ghost}`} onClick={resetAll}>Reset</button>
        <button
          className={`${styles.ctrl} ${running ? styles.stop : styles.start}`}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "Pause" : elapsed ? "Resume" : "Start"}
        </button>
      </div>
    </div>
  );
}
