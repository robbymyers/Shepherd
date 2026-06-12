"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Screen from "@/components/Screen";
import DetailBar from "@/components/DetailBar";
import Modal from "@/components/Modal";
import { useStore } from "@/lib/store";
import { longDate } from "@/lib/format";
import { StopwatchIcon } from "@/components/Icons";
import type { WodScore } from "@/lib/types";
import styles from "./wod.module.css";

export default function WodPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, wods, addScore } = useStore();
  const wod = wods.find((w) => w.id === id);
  const [recording, setRecording] = useState(false);

  if (!ready) {
    return (
      <Screen tabbar={false}>
        <DetailBar />
        <p className="muted">Loading…</p>
      </Screen>
    );
  }
  if (!wod) {
    return (
      <Screen tabbar={false}>
        <DetailBar title="Not found" />
      </Screen>
    );
  }

  return (
    <Screen>
      <DetailBar title={wod.title} />

      <div className={styles.descCard}>
        {wod.description ? (
          <pre className={styles.desc}>{wod.description}</pre>
        ) : (
          <p className={styles.desc}>{wod.type}</p>
        )}
        {wod.weight && <p className={styles.weight}>♂ {wod.weight}</p>}
      </div>

      {wod.scores.map((s, i) => (
        <div key={i} className={styles.scoreCard}>
          <div className={styles.scoreLeft}>
            <span className={styles.scoreDate}>{longDate(s.date)}</span>
            {s.notes && <p className={styles.scoreNotes}>{s.notes}</p>}
          </div>
          <div className={styles.scoreRight}>
            <span className={`display ${styles.scoreNum}`}>{s.score}</span>
            <div className={styles.badges}>
              {s.rx && <span className={`${styles.bdg} ${styles.bdgRx}`}>Rx</span>}
              <span className={`${styles.bdg} ${s.pr ? styles.bdgPr : styles.bdgOff}`}>
                PR
              </span>
            </div>
          </div>
        </div>
      ))}

      {wod.scores.length === 0 && (
        <p className="muted" style={{ padding: "8px 4px 20px" }}>
          No scores recorded yet — log your first attempt.
        </p>
      )}

      <button className={`btn btn-primary ${styles.record}`} onClick={() => setRecording(true)}>
        <StopwatchIcon width={20} height={20} /> Record Score
      </button>

      <Modal open={recording} onClose={() => setRecording(false)}>
        <RecordScore
          title={wod.title}
          type={wod.type}
          onSave={(s) => {
            addScore(wod.id, s);
            setRecording(false);
          }}
          onCancel={() => setRecording(false)}
        />
      </Modal>
    </Screen>
  );
}

function RecordScore({
  title,
  type,
  onSave,
  onCancel,
}: {
  title: string;
  type: string;
  onSave: (s: WodScore) => void;
  onCancel: () => void;
}) {
  const [score, setScore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rx, setRx] = useState(false);
  const [pr, setPr] = useState(false);

  return (
    <div>
      <div className={styles.recTop}>
        <h2 className={`display ${styles.recTitle}`}>{title}</h2>
        <div className={styles.recActions}>
          <button
            className={`chip rx ${rx ? "on" : ""}`}
            onClick={() => setRx((v) => !v)}
            aria-pressed={rx}
          >
            Rx
          </button>
          <button
            className={`chip pr ${pr ? "on" : ""}`}
            onClick={() => setPr((v) => !v)}
            aria-pressed={pr}
          >
            PR
          </button>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Score ({type})</label>
        <input
          className="input input-display"
          placeholder="43:38"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">Date</label>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <button
        className="btn btn-primary"
        style={{ width: "100%", marginTop: 6 }}
        onClick={() =>
          score.trim() &&
          onSave({ date, score: score.trim(), scoreType: type, rx, pr, notes: null })
        }
      >
        Save Score
      </button>
      <button className={styles.cancel} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
