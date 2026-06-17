"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Screen from "@/components/Screen";
import DetailBar from "@/components/DetailBar";
import Modal from "@/components/Modal";
import { useStore } from "@/lib/store";
import { longDate } from "@/lib/format";
import { Plus, Chevron } from "@/components/Icons";
import type { MovementSession } from "@/lib/types";
import styles from "./movement.module.css";

function pctRows(weight: number) {
  const rows = [];
  for (let p = 95; p >= 50; p -= 5) {
    rows.push({ pct: p, value: Math.round((weight * p) / 100 / 5) * 5 });
  }
  return rows;
}

export default function MovementPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, movements, addSession } = useStore();
  const movement = movements.find((m) => m.id === id);
  const [pctFor, setPctFor] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  if (!ready) {
    return (
      <Screen tabbar={false}>
        <DetailBar />
        <p className="muted">Loading…</p>
      </Screen>
    );
  }
  if (!movement) {
    return (
      <Screen tabbar={false}>
        <DetailBar title="Not found" />
      </Screen>
    );
  }

  return (
    <Screen>
      <DetailBar
        right={
          <button className={styles.add} onClick={() => setAdding(true)} aria-label="Add session">
            <Plus width={22} height={22} />
          </button>
        }
      />

      <div className={styles.hero}>
        <button
          className={styles.pctLink}
          onClick={() => movement.best && setPctFor(movement.best)}
          disabled={!movement.best}
        >
          % Percentages <Chevron width={14} height={14} />
        </button>
        <div className={styles.heroRow}>
          <div className={styles.heroLeft}>
            <h1 className={`display ${styles.heroName}`}>{movement.name}</h1>
            {movement.best && movement.bestDate ? (
              <p className={styles.heroDate}>{longDate(movement.bestDate)}</p>
            ) : (
              <p className={styles.heroDate}>No sessions logged yet.</p>
            )}
          </div>
          {movement.best && (
            <div className={styles.heroRight}>
              <span className={`display ${styles.heroNum}`}>{movement.best}</span>
              <span className={styles.heroUnit}>1RM</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.sessions}>
        {movement.sessions.map((s, i) => (
          <div key={i} className={styles.session}>
            <div className={styles.sessionTop}>
              <span className={styles.sessionDate}>{longDate(s.date)}</span>
              {s.weight != null && (
                <button className={styles.pctLinkSm} onClick={() => setPctFor(s.weight!)}>
                  % Percentages <Chevron width={13} height={13} />
                </button>
              )}
            </div>
            <div className={styles.sessionBody}>
              <div className={styles.col}>
                <span className={styles.colLabel}>Sets</span>
                <span className={styles.colVal}>{s.sets ?? "—"}</span>
              </div>
              <div className={styles.col}>
                <span className={styles.colLabel}>Reps</span>
                <span className={styles.colVal}>{s.reps ?? "—"}</span>
              </div>
              <span className={`display ${styles.sessionWeight}`}>
                {s.weight ?? "—"}
              </span>
            </div>
            {s.notes && <p className={styles.notes}>{s.notes}</p>}
          </div>
        ))}
      </div>

      {/* Percentages table */}
      <Modal open={pctFor != null} onClose={() => setPctFor(null)}>
        {pctFor != null && (
          <div>
            <div className={`${styles.hero} ${styles.heroPct}`}>
              <div className={styles.heroRow}>
                <div className={styles.heroLeft}>
                  <h1 className={`display ${styles.heroName}`}>{movement.name}</h1>
                </div>
                <div className={styles.heroRight}>
                  <span className={`display ${styles.heroNum}`}>{pctFor}</span>
                  <span className={styles.heroUnit}>LBS</span>
                </div>
              </div>
            </div>
            <div className={styles.pctTable}>
              {pctRows(pctFor).map((r) => (
                <div key={r.pct} className={styles.pctRow}>
                  <span className={styles.pctPct}>{r.pct}%</span>
                  <span className={`display ${styles.pctVal}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Add session */}
      <Modal open={adding} onClose={() => setAdding(false)}>
        <AddSession
          name={movement.name}
          onSave={(s) => {
            addSession(movement.id, s);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </Screen>
  );
}

function AddSession({
  name,
  onSave,
  onCancel,
}: {
  name: string;
  onSave: (s: MovementSession) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [orm, setOrm] = useState(false);

  return (
    <div>
      <div className={styles.formTop}>
        <h2 className={`display ${styles.formTitle}`}>{name}</h2>
        <button className={styles.save} onClick={onCancel}>✕</button>
      </div>
      <div className="field">
        <label className="field-label">Date</label>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">Weight (lbs)</label>
        <input className="input" inputMode="numeric" placeholder="335" value={weight} onChange={(e) => setWeight(e.target.value)} />
      </div>
      <div className="field-row">
        <div className="field">
          <label className="field-label">Sets</label>
          <input className="input" inputMode="numeric" placeholder="1" value={sets} onChange={(e) => setSets(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Reps</label>
          <input className="input" inputMode="numeric" placeholder="3" value={reps} onChange={(e) => setReps(e.target.value)} />
        </div>
      </div>
      <label className={styles.checkRow}>
        <span>Mark as 1 Rep Max</span>
        <input type="checkbox" checked={orm} onChange={(e) => setOrm(e.target.checked)} />
      </label>
      <button
        className="btn btn-primary"
        style={{ width: "100%", marginTop: 8 }}
        onClick={() =>
          weight &&
          onSave({
            date,
            weight: parseFloat(weight),
            sets: sets || null,
            reps: reps || null,
            oneRepMax: orm,
            notes: null,
          })
        }
      >
        Save Session
      </button>
    </div>
  );
}
