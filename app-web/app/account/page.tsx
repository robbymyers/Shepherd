"use client";

import { useState } from "react";
import Screen from "@/components/Screen";
import ProfileHeader from "@/components/ProfileHeader";
import { useStore } from "@/lib/store";
import styles from "./account.module.css";

export default function AccountPage() {
  const {
    ready, theme, toggleTheme, events, movements, wods,
    signedIn, authEmail, sendCode, verifyCode, signOut,
  } = useStore();

  const stats = ready
    ? [
        { label: "Events Logged", value: events.length },
        { label: "Movements Tracked", value: movements.filter((m) => m.sessions.length).length },
        { label: "Workouts Logged", value: wods.filter((w) => w.logged).length },
      ]
    : [];

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

      <SignInRow
        signedIn={signedIn}
        authEmail={authEmail}
        sendCode={sendCode}
        verifyCode={verifyCode}
        signOut={signOut}
      />
    </Screen>
  );
}

function SignInRow({
  signedIn, authEmail, sendCode, verifyCode, signOut,
}: {
  signedIn: boolean;
  authEmail: string | null;
  sendCode: (email: string) => Promise<string | null>;
  verifyCode: (email: string, token: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (signedIn) {
    return (
      <div className={styles.row}>
        <div>
          <p className={styles.rowTitle}>Editing enabled</p>
          <p className={styles.rowSub}>Signed in as {authEmail}</p>
        </div>
        <button className={styles.reset} onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  async function send() {
    if (!email.trim()) return;
    setBusy(true); setMsg(null);
    const err = await sendCode(email);
    setBusy(false);
    if (err) setMsg(err);
    else { setSent(true); setMsg("Code sent — check your email."); }
  }
  async function verify() {
    if (!code.trim()) return;
    setBusy(true); setMsg(null);
    const err = await verifyCode(email, code);
    setBusy(false);
    if (err) setMsg(err);
  }

  return (
    <div className={styles.authBlock}>
      <p className={styles.rowTitle}>Sign in to edit</p>
      <p className={styles.rowSub}>
        Viewing is open to everyone. Enter your email to get a one-time code and unlock logging.
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
          disabled={sent}
        />
        {sent && (
          <input
            className="input"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        )}
        {!sent ? (
          <button className="btn btn-primary" onClick={send} disabled={busy}>
            {busy ? "Sending…" : "Send Code"}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={verify} disabled={busy}>
            {busy ? "Verifying…" : "Verify & Sign In"}
          </button>
        )}
      </div>
      {msg && <p className={styles.authMsg}>{msg}</p>}
    </div>
  );
}
