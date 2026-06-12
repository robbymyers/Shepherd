"use client";

import type { RunSplit } from "@/lib/types";
import styles from "./Splits.module.css";

export default function Splits({ splits }: { splits: RunSplit[] }) {
  const max = Math.max(...splits.map((s) => s.seconds));
  return (
    <section>
      <h3 className={`display ${styles.title}`}>Splits</h3>
      <div className={styles.panel}>
        <div className={styles.head}>
          <span>Mi</span>
          <span>Pace</span>
        </div>
        {splits.map((s) => (
          <div key={s.mile} className={styles.row}>
            <span className={styles.mile}>{s.mile}</span>
            <span className={styles.track}>
              <span
                className={styles.bar}
                style={{ width: `${Math.round((s.seconds / max) * 100)}%` }}
              />
            </span>
            <span className={styles.pace}>{s.pace}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
