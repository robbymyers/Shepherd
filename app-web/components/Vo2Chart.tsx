"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { localDate, longDate } from "@/lib/format";
import styles from "./Vo2Chart.module.css";

const RANGES: { key: string; days: number }[] = [
  { key: "M", days: 31 },
  { key: "3M", days: 92 },
  { key: "6M", days: 183 },
  { key: "Y", days: 365 },
  { key: "All", days: 100000 },
];

const W = 320;
const H = 150;
const PAD = { l: 6, r: 30, t: 14, b: 18 };

function classify(v: number) {
  if (v < 40) return { label: "Below Average", cls: styles.below };
  if (v < 46) return { label: "Average", cls: styles.avg };
  return { label: "Above Average", cls: styles.above };
}

export default function Vo2Chart() {
  const { ready, vo2max } = useStore();
  const [range, setRange] = useState("Y");

  const data = useMemo(() => {
    if (!ready || !vo2max.length) return [];
    const sorted = [...vo2max].sort((a, b) => (a.date < b.date ? -1 : 1));
    const latest = localDate(sorted[sorted.length - 1].date).getTime();
    const days = RANGES.find((r) => r.key === range)!.days;
    const cutoff = latest - days * 86400000;
    let pts = sorted.filter((p) => localDate(p.date).getTime() >= cutoff);
    if (pts.length < 2) pts = sorted.slice(-6); // keep the chart legible
    return pts;
  }, [ready, vo2max, range]);

  const latest = data[data.length - 1];
  const cat = latest ? classify(latest.value) : null;

  const geom = useMemo(() => {
    if (data.length < 2) return null;
    const xs = data.map((p) => localDate(p.date).getTime());
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const vals = data.map((p) => p.value);
    const lo = Math.floor((Math.min(...vals) - 2) / 5) * 5;
    const hi = Math.ceil((Math.max(...vals) + 2) / 5) * 5;
    const px = (t: number) =>
      PAD.l + ((t - minX) / (maxX - minX || 1)) * (W - PAD.l - PAD.r);
    const py = (v: number) =>
      PAD.t + (1 - (v - lo) / (hi - lo || 1)) * (H - PAD.t - PAD.b);
    const pts = data.map((p) => ({
      x: px(localDate(p.date).getTime()),
      y: py(p.value),
      v: p.value,
    }));
    const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
    const area = `${line} L${pts[pts.length - 1].x},${H - PAD.b} L${pts[0].x},${H - PAD.b} Z`;
    return { pts, line, area, lo, hi, py };
  }, [data]);

  return (
    <div className={styles.head}>
      <div className={styles.titleRow}>
        <div>
          <h2 className={`display ${styles.title}`}>
            VO<sub>2</sub> MAX
          </h2>
          {latest && <p className={styles.date}>{longDate(latest.date)}</p>}
        </div>
        {cat && <span className={`${styles.tag} ${cat.cls}`}>{cat.label}</span>}
      </div>

      <div className={styles.tabs}>
        {RANGES.map((r) => (
          <button
            key={r.key}
            className={range === r.key ? styles.tabOn : ""}
            onClick={() => setRange(r.key)}
          >
            {r.key}
          </button>
        ))}
      </div>

      <div className={styles.chartWrap}>
        {geom ? (
          <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} preserveAspectRatio="none">
            <defs>
              <linearGradient id="vo2fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-green)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--color-green)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[geom.hi, (geom.hi + geom.lo) / 2, geom.lo].map((v, i) => (
              <g key={i}>
                <line
                  x1={PAD.l} x2={W - PAD.r}
                  y1={geom.py(v)} y2={geom.py(v)}
                  className={styles.grid}
                />
                <text x={W - PAD.r + 4} y={geom.py(v) + 3} className={styles.axis}>
                  {v}
                </text>
              </g>
            ))}
            <path d={geom.area} fill="url(#vo2fill)" />
            <path d={geom.line} className={styles.line} />
            {geom.pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2} className={styles.dot} />
            ))}
            <circle
              cx={geom.pts[geom.pts.length - 1].x}
              cy={geom.pts[geom.pts.length - 1].y}
              r={4.5}
              className={styles.latest}
            />
          </svg>
        ) : (
          <p className="muted" style={{ padding: 20, textAlign: "center" }}>
            Not enough data in this range.
          </p>
        )}
      </div>

      {latest && (
        <div className={styles.readout}>
          <span className={`display ${styles.readNum}`}>{latest.value}</span>
          <span className={styles.readUnit}>ml/kg/min</span>
        </div>
      )}
    </div>
  );
}
