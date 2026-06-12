"use client";

import { useState } from "react";
import type { SportEvent, EventKind } from "@/lib/types";
import { useStore } from "@/lib/store";
import { longDateTime } from "@/lib/format";
import { Back, Dots, LocationArrow } from "./Icons";
import RouteMap from "./RouteMap";
import Splits from "./Splits";
import styles from "./EventForm.module.css";

const SCORE_TYPES = ["For Time", "For Rounds", "For Repetitions"] as const;
const SCORE_HINT: Record<string, string> = {
  "For Time": "4:16",
  "For Rounds": "19+11",
  "For Repetitions": "220",
};

function toLocalInput(iso: string): string {
  // ISO -> "YYYY-MM-DDTHH:mm" for datetime-local
  return iso.slice(0, 16);
}

export default function EventForm({
  initial,
  onDone,
}: {
  initial?: SportEvent;
  onDone: () => void;
}) {
  const { addEvent, updateEvent, deleteEvent } = useStore();
  const editing = !!initial;

  const [kind, setKind] = useState<EventKind>(initial?.kind ?? "workout");
  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(
    toLocalInput(initial?.date ?? new Date().toISOString())
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [scoreType, setScoreType] = useState(initial?.scoreType ?? "");
  const [score, setScore] = useState(initial?.score ?? "");
  const [pr, setPr] = useState(initial?.pr ?? false);
  const [rx, setRx] = useState(initial?.rx ?? false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isRun = kind === "run" || kind === "walk";

  function save() {
    if (!name.trim()) return;
    const patch: Omit<SportEvent, "id" | "source"> = {
      ...initial,
      kind,
      name: name.trim(),
      date,
      location: location.trim() || null,
      description: description.trim() || null,
      scoreType: !isRun ? scoreType || null : null,
      score: !isRun ? score.trim() || null : null,
      pr: !isRun ? pr : undefined,
      rx: !isRun ? rx : undefined,
    };
    if (editing && initial) updateEvent(initial.id, patch);
    else addEvent(patch);
    onDone();
  }

  function remove() {
    if (initial) deleteEvent(initial.id);
    onDone();
  }

  return (
    <div className={styles.form}>
      {/* ---- header: back + overflow menu ---- */}
      <div className={styles.topbar}>
        <button className={styles.back} onClick={onDone} aria-label="Back">
          <Back width={11} height={19} />
        </button>
        <div className={styles.menuWrap}>
          <button
            className={styles.dots}
            onClick={() => editing && setMenuOpen((v) => !v)}
            aria-label="More options"
            aria-expanded={menuOpen}
          >
            <Dots width={22} height={22} />
          </button>
          {menuOpen && editing && (
            <div className={styles.menu}>
              <button className={styles.menuDelete} onClick={remove}>
                Delete Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- add mode: kind toggles + PR/Rx chips ---- */}
      {!editing && (
        <div className={styles.kindRow}>
          <div className={styles.kinds}>
            <button
              className={`${styles.kbadge} ${styles.kCross} ${!isRun ? styles.kOn : ""}`}
              onClick={() => setKind("workout")}
            >
              CROSSFIT
            </button>
            <button
              className={`${styles.kbadge} ${styles.kRun} ${isRun ? styles.kOn : ""}`}
              onClick={() => setKind("run")}
            >
              RUN
            </button>
          </div>
          {!isRun && (
            <div className={styles.flags}>
              <button
                className={styles.flag}
                onClick={() => setPr((v) => !v)}
                aria-pressed={pr}
                aria-label="Personal record"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pr ? "/icons/icon-PR-active.svg" : "/icons/icon-PR-default.svg"}
                  alt=""
                  width={pr ? 36 : 20}
                  height={pr ? 36 : 16}
                />
              </button>
              <button
                className={styles.flag}
                onClick={() => setRx((v) => !v)}
                aria-pressed={rx}
                aria-label="As prescribed"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rx ? "/icons/icon-Rx-active.svg" : "/icons/icon-Rx-default.svg"}
                  alt=""
                  width={rx ? 36 : 18}
                  height={rx ? 36 : 18}
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- name ---- */}
      <input
        className={`input input-display ${styles.bare} ${styles.nameInput}`}
        placeholder={isRun ? "TRAIL RUN" : "CROSSFIT"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* ---- date (add mode): plain text, taps open the native picker ---- */}
      {!editing && (
        <div className={styles.dateLine}>
          <span>{longDateTime(date)}</span>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            aria-label="Date and time"
          />
        </div>
      )}

      {/* ---- location (not on run edit, per design) ---- */}
      {(!editing || !isRun) && (
        <div className={styles.locWrap}>
          <input
            className={`input input-display ${styles.bare} ${styles.locInput}`}
            placeholder={isRun ? "CRAIGHEAD FOREST PARK" : "CROSSFIT RIDGE CITY"}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <LocationArrow className={styles.locIcon} width={18} height={18} />
        </div>
      )}

      {/* ---- crossfit scoring (add mode) ---- */}
      {!editing && !isRun && (
        <div className={styles.scoreRow}>
          <select
            className={styles.scoreType}
            value={scoreType}
            onChange={(e) => setScoreType(e.target.value)}
            aria-label="Score type"
          >
            <option value="">Score Type</option>
            {SCORE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            className={styles.scoreInput}
            placeholder={scoreType ? SCORE_HINT[scoreType] : "Set Type First"}
            disabled={!scoreType}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            aria-label="Score"
          />
        </div>
      )}

      {/* ---- description ---- */}
      <textarea
        className={`textarea ${styles.bare} ${styles.desc}`}
        placeholder={isRun ? "How'd it go today?" : "Enter WOD Description"}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* ---- run edit: route + splits ---- */}
      {editing && isRun && initial?.route && (
        <div className={styles.mapBlock}>
          <RouteMap route={initial.route} />
        </div>
      )}
      {editing && isRun && initial?.splits && <Splits splits={initial.splits} />}

      {/* ---- footer ---- */}
      <div className={styles.footer}>
        {editing ? (
          <button className={`btn btn-primary ${styles.update}`} onClick={save}>
            Update Event
          </button>
        ) : (
          <>
            <button
              className={styles.strava}
              title="Strava sync arrives with V2"
              onClick={() => {}}
            >
              Upload from Strava
            </button>
            <button className={`btn btn-primary ${styles.saveBtn}`} onClick={save}>
              Save Event
            </button>
          </>
        )}
      </div>
    </div>
  );
}
