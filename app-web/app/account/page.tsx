"use client";

import Screen from "@/components/Screen";
import ProfileHeader from "@/components/ProfileHeader";
import { useStore } from "@/lib/store";
import styles from "./account.module.css";

export default function AccountPage() {
  const { ready, theme, toggleTheme, events, movements, wods } = useStore();

  const stats = ready
    ? [
        { label: "Events Logged", value: events.length },
        { label: "Movements Tracked", value: movements.filter((m) => m.sessions.length).length },
        { label: "Workouts Logged", value: wods.filter((w) => w.logged).length },
      ]
    : [];

  function resetData() {
    if (confirm("Reset all local edits back to the imported data?")) {
      localStorage.removeItem("shepherd:data:v1");
      localStorage.removeItem("shepherd:progressOrder:v1");
      location.reload();
    }
  }

  return (
    <Screen>
      <ProfileHeader />

      {ready && (
        <div className={styles.stats}>
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={`display ${styles.statNum}`}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <h2 className={styles.sectionTitle}>Settings</h2>
      <div className={styles.divider} />

      <div className={styles.row}>
        <div>
          <p className={styles.rowTitle}>Theme</p>
          <p className={styles.rowSub}>
            Currently {theme === "dark" ? "Dark" : "Light"} · follows system by default
          </p>
        </div>
        <button
          className={`${styles.switch} ${theme === "dark" ? styles.dark : styles.light}`}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <span className={styles.knob}>{theme === "dark" ? "🌙" : "☀︎"}</span>
        </button>
      </div>

      <div className={styles.row}>
        <div>
          <p className={styles.rowTitle}>Reset Data</p>
          <p className={styles.rowSub}>Discard local edits, restore the import</p>
        </div>
        <button className={styles.reset} onClick={resetData}>Reset</button>
      </div>
    </Screen>
  );
}
