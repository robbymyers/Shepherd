"use client";

import { useState } from "react";
import type { SportEvent, EventKind } from "@/lib/types";
import { useStore } from "@/lib/store";
import { LocationArrow } from "./Icons";
import styles from "./EventForm.module.css";

function toLocalInput(iso: string): string {
  // ISO -> "YYYY-MM-DDTHH:mm" for datetime-local
  return iso.slice(0, 16);
}
function secsFromClock(v: string): number | null {
  const parts = v.split(":").map((n) => parseInt(n, 10));
  if (parts.some(isNaN) || !parts.length) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}
function clock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
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
  const [distance, setDistance] = useState(
    initial?.distance != null ? String(initial.distance) : ""
  );
  const [time, setTime] = useState(initial?.movingTime ?? "");
  const [calories, setCalories] = useState(
    initial?.calories != null ? String(initial.calories) : ""
  );

  const isRun = kind === "run";

  function save() {
    if (!name.trim()) return;
    const movingSeconds = time ? secsFromClock(time) : null;
    const dist = distance ? parseFloat(distance) : null;
    const patch: Omit<SportEvent, "id" | "source"> = {
      kind,
      name: name.trim(),
      date: new Date(date).toISOString(),
      location: location.trim() || null,
      description: description.trim() || null,
      movingTime: movingSeconds != null ? clock(movingSeconds) : null,
      movingSeconds,
      distance: dist,
      calories: calories ? parseInt(calories, 10) : null,
      elevationGain: initial?.elevationGain ?? null,
      avgHeartRate: initial?.avgHeartRate ?? null,
      maxHeartRate: initial?.maxHeartRate ?? null,
      gear: initial?.gear ?? null,
      pace:
        isRun && dist && movingSeconds
          ? `${Math.floor(movingSeconds / dist / 60)}:${String(
              Math.round((movingSeconds / dist) % 60)
            ).padStart(2, "0")}/mi`
          : null,
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
      <div className={styles.topbar}>
        <h2 className={`display ${styles.heading}`}>
          {editing ? "Edit Event" : "Log Event"}
        </h2>
        <button className={styles.close} onClick={onDone} aria-label="Close">✕</button>
      </div>

      <div className={`seg ${styles.seg}`}>
        <button
          className={`cross ${kind === "workout" ? "on" : ""}`}
          onClick={() => setKind("workout")}
        >
          CROSSFIT
        </button>
        <button
          className={`run ${isRun ? "on" : ""}`}
          onClick={() => setKind("run")}
        >
          RUN
        </button>
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <input
          className="input input-display"
          placeholder={isRun ? "TRAIL RUN" : "CROSSFIT"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label">Date</label>
        <input
          className="input"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label">Location</label>
        <div className={styles.locWrap}>
          <input
            className="input"
            placeholder={isRun ? "Craighead Forest Park" : "CrossFit Ridge City"}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <LocationArrow className={styles.locIcon} width={18} height={18} />
        </div>
      </div>

      <div className="field-row">
        {isRun && (
          <div className="field">
            <label className="field-label">Distance (mi)</label>
            <input
              className="input"
              inputMode="decimal"
              placeholder="2.65"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
        )}
        <div className="field">
          <label className="field-label">Time (mm:ss)</label>
          <input
            className="input"
            placeholder="26:27"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        {!isRun && (
          <div className="field">
            <label className="field-label">Calories</label>
            <input
              className="input"
              inputMode="numeric"
              placeholder="263"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="field">
        <label className="field-label">
          {isRun ? "How'd it go today?" : "WOD Description"}
        </label>
        <textarea
          className="textarea"
          placeholder={isRun ? "How'd it go today?" : "Enter WOD description"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button className={`btn btn-primary ${styles.save}`} onClick={save}>
        {editing ? "Update Event" : "Save Event"}
      </button>

      {editing && (
        <button className={styles.delete} onClick={remove}>
          Delete Event
        </button>
      )}
    </div>
  );
}
