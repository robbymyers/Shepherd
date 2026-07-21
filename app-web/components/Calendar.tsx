"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { localDate, MONTHS, YYYYMMDD } from "@/lib/format";
import { Back, Chevron, ShoeIcon, StopwatchIcon } from "./Icons";
import styles from "./Calendar.module.css";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar() {
  const { ready, events } = useStore();

  // marker map: date -> { run, workout }
  const marks = useMemo(() => {
    const m: Record<string, { run: boolean; workout: boolean }> = {};
    if (!ready) return m;
    for (const e of events) {
      const key = YYYYMMDD(localDate(e.date));
      const slot = (m[key] ||= { run: false, workout: false });
      if (e.kind === "workout") slot.workout = true;
      else slot.run = true; // run + walk
    }
    return m;
  }, [ready, events]);

  // always open on the current month (not the latest logged event's month);
  // month arrows still let you browse freely from there
  const [view, setView] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), mo: now.getMonth() };
  });

  const { y, mo } = view;
  const first = new Date(y, mo, 1).getDay();
  const days = new Date(y, mo + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(first).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const shift = (n: number) =>
    setView(({ y, mo }) => {
      const d = new Date(y, mo + n, 1);
      return { y: d.getFullYear(), mo: d.getMonth() };
    });

  return (
    <div className={`card ${styles.cal}`}>
      <div className={styles.head}>
        <button className={styles.nav} onClick={() => shift(-1)} aria-label="Previous month">
          <Back width={18} height={18} />
        </button>
        <span className={`display ${styles.month}`}>
          {MONTHS[mo]} {y}
        </span>
        <button className={styles.nav} onClick={() => shift(1)} aria-label="Next month">
          <Chevron width={18} height={18} />
        </button>
      </div>

      <div className={styles.dow}>
        {DOW.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const key = YYYYMMDD(new Date(y, mo, day));
          const mk = marks[key];
          const cls = mk
            ? mk.run && mk.workout
              ? styles.both
              : mk.workout
              ? styles.workout
              : styles.run
            : "";
          const label = mk
            ? `${MONTHS[mo]} ${day}: ${[mk.workout && "workout", mk.run && "run"].filter(Boolean).join(" + ")}`
            : undefined;
          return (
            <span key={i} className={`${styles.day} ${cls}`} aria-label={label}>
              {mk ? (
                mk.workout ? (
                  <StopwatchIcon width={16} height={18} />
                ) : (
                  <ShoeIcon width={18} height={16} />
                )
              ) : (
                day
              )}
            </span>
          );
        })}
      </div>

      <div className={styles.legend}>
        <span className={styles.legRun}>Run</span>
        <span className={styles.legWork}>Workout</span>
      </div>
    </div>
  );
}
