"use client";

import Screen from "@/components/Screen";
import ProfileHeader from "@/components/ProfileHeader";
import Calendar from "@/components/Calendar";
import Vo2Chart from "@/components/Vo2Chart";
import Reorder from "@/components/Reorder";
import { useStore } from "@/lib/store";
import { longDate } from "@/lib/format";
import type { ProgressCardId } from "@/lib/types";
import styles from "./progress.module.css";

export default function ProgressPage() {
  const { ready, prHighlights, runHighlights, progressOrder, setProgressOrder } = useStore();

  function renderCard(id: ProgressCardId) {
    if (id === "vo2") {
      return (
        <div className="prog-card">
          <Vo2Chart />
        </div>
      );
    }
    if (id === "pr") {
      return (
        <div className="prog-card">
          <h2 className={`display ${styles.title} ${styles.pr}`}>PR Highlights</h2>
          <div className={styles.rows}>
            {prHighlights.map((h) => (
              <div key={h.label} className={styles.row}>
                <div className={styles.rowMeta}>
                  <span className={`display ${styles.rowLabel}`}>{h.label}</span>
                  <span className={styles.rowDate}>{longDate(h.date)}</span>
                </div>
                <span className={`display ${styles.rowVal}`}>{h.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="prog-card">
        <h2 className={`display ${styles.title} ${styles.runs}`}>Runs</h2>
        <div className={styles.rows}>
          {runHighlights.map((h) => (
            <div key={h.label} className={styles.row}>
              <div className={styles.rowMeta}>
                <span className={`display ${styles.rowLabel}`}>{h.label}</span>
                <span className={styles.rowDate}>{longDate(h.date)}</span>
              </div>
              <span className={`display ${styles.rowVal}`}>{h.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Screen>
      <ProfileHeader compact />
      <Calendar />
      <div style={{ height: 16 }} />
      {ready ? (
        <Reorder
          order={progressOrder}
          onReorder={(o) => setProgressOrder(o as ProgressCardId[])}
          render={(id) => renderCard(id as ProgressCardId)}
        />
      ) : (
        <p className="muted">Loading…</p>
      )}
      <p className={styles.hint}>Drag the handles to reorder your highlights.</p>
    </Screen>
  );
}
