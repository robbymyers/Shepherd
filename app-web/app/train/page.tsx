"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Screen from "@/components/Screen";
import ProfileHeader from "@/components/ProfileHeader";
import { useStore } from "@/lib/store";
import { Chevron, StopwatchIcon } from "@/components/Icons";
import styles from "./train.module.css";

type Tab = "movements" | "workouts";

export default function TrainPage() {
  const { ready, movements, wods } = useStore();
  const [tab, setTab] = useState<Tab>("movements");
  const [loggedOnly, setLoggedOnly] = useState(false);

  const rows = useMemo(() => {
    if (!ready) return [];
    if (tab === "movements") {
      return movements
        .filter((m) => (loggedOnly ? m.sessions.length > 0 : true))
        .map((m) => ({
          id: m.id,
          href: `/train/movement/${m.id}`,
          label: m.name,
          meta: m.best ? `${m.best} lbs` : null,
          logged: m.sessions.length > 0,
        }));
    }
    return wods
      .filter((w) => (loggedOnly ? w.logged : true))
      .map((w) => ({
        id: w.id,
        href: `/train/wod/${w.id}`,
        label: w.title,
        meta: w.logged ? w.scores[0]?.score ?? null : w.type,
        logged: w.logged,
      }));
  }, [ready, tab, movements, wods, loggedOnly]);

  return (
    <Screen>
      <ProfileHeader />

      <div className={styles.controls}>
        <div className={styles.seg}>
          <button
            className={tab === "movements" ? styles.on : ""}
            onClick={() => setTab("movements")}
          >
            MOVEMENTS
          </button>
          <button
            className={tab === "workouts" ? styles.on : ""}
            onClick={() => setTab("workouts")}
          >
            WORKOUTS
          </button>
        </div>
        <button
          className={`${styles.stopwatch} ${loggedOnly ? styles.swOn : ""}`}
          onClick={() => setLoggedOnly((v) => !v)}
          aria-pressed={loggedOnly}
          aria-label="Show logged only"
          title="Show only logged"
        >
          <StopwatchIcon width={22} height={22} />
        </button>
      </div>

      {loggedOnly && (
        <p className={styles.filterNote}>
          Showing {rows.length} logged {tab}
        </p>
      )}

      <div className={styles.list}>
        {rows.map((r) => (
          <Link key={r.id} href={r.href} className={styles.row}>
            <span className={styles.rowLabel}>{r.label}</span>
            <span className={styles.rowRight}>
              {r.meta && <span className={styles.rowMeta}>{r.meta}</span>}
              <Chevron width={20} height={20} className={styles.chev} />
            </span>
          </Link>
        ))}
        {ready && rows.length === 0 && (
          <p className="muted" style={{ padding: "30px 4px" }}>Nothing logged yet.</p>
        )}
      </div>
    </Screen>
  );
}
