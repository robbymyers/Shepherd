"use client";

import { useState } from "react";
import Screen from "@/components/Screen";
import ProfileHeader from "@/components/ProfileHeader";
import Modal from "@/components/Modal";
import Timers from "@/components/Timers";
import { useStore } from "@/lib/store";
import { Chevron } from "@/components/Icons";
import styles from "./account.module.css";

export default function AccountPage() {
  const {
    ready, theme, toggleTheme, events, movements, wods,
    signedIn, authEmail, signIn, changePassword, signOut,
  } = useStore();

  const stats = ready
    ? [
        { label: "Events Logged", value: events.length },
        { label: "Movements Tracked", value: movements.filter((m) => m.sessions.length).length },
        { label: "Workouts Logged", value: wods.filter((w) => w.logged).length },
      ]
    : [];

  const [timersOpen, setTimersOpen] = useState(false);

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

      <h2 className={styles.sectionTitle}>Timers</h2>
      <div className={styles.divider} />
      <button className={`${styles.row} ${styles.navRow}`} onClick={() => setTimersOpen(true)}>
        <div>
          <p className={styles.rowTitle}>Workout Timers</p>
          <p className={styles.rowSub}>Standard · Countdown · Interval · Tabata · Lap</p>
        </div>
        <Chevron width={20} height={20} style={{ color: "var(--color-white-700)" }} />
      </button>

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

      <AuthRow
        signedIn={signedIn}
        authEmail={authEmail}
        signIn={signIn}
        changePassword={changePassword}
        signOut={signOut}
      />

      <Modal full open={timersOpen} onClose={() => setTimersOpen(false)}>
        <Timers onClose={() => setTimersOpen(false)} />
      </Modal>
    </Screen>
  );
}

function AuthRow({
  signedIn, authEmail, signIn, changePassword, signOut,
}: {
  signedIn: boolean;
  authEmail: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  changePassword: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);
  const [newPw, setNewPw] = useState("");

  if (signedIn) {
    async function applyChange() {
      if (newPw.length < 6) { setMsg("Password must be at least 6 characters."); return; }
      setBusy(true); setMsg(null);
      const err = await changePassword(newPw);
      setBusy(false);
      if (err) setMsg(err);
      else { setMsg("Password updated."); setNewPw(""); setChanging(false); }
    }
    return (
      <div className={styles.authBlock}>
        <div className={styles.authHead}>
          <div>
            <p className={styles.rowTitle}>Editing enabled</p>
            <p className={styles.rowSub}>Signed in as {authEmail}</p>
          </div>
          <button className={styles.reset} onClick={() => signOut()}>Sign Out</button>
        </div>
        {changing ? (
          <div className={styles.authForm}>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="New password (min 6 chars)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
            <button className="btn btn-primary" onClick={applyChange} disabled={busy}>
              {busy ? "Saving…" : "Save New Password"}
            </button>
          </div>
        ) : (
          <button className={styles.linkBtn} onClick={() => { setChanging(true); setMsg(null); }}>
            Change password
          </button>
        )}
        {msg && <p className={styles.authMsg}>{msg}</p>}
      </div>
    );
  }

  async function submit() {
    if (!email.trim() || !password) return;
    setBusy(true); setMsg(null);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) setMsg(err);
  }

  return (
    <div className={styles.authBlock}>
      <p className={styles.rowTitle}>Sign in to edit</p>
      <p className={styles.rowSub}>
        Viewing is open to everyone. Sign in to log workouts, runs, lifts and scores.
      </p>
      <div className={styles.authForm}>
        <input
          className="input"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </div>
      {msg && <p className={styles.authMsg}>{msg}</p>}
    </div>
  );
}
