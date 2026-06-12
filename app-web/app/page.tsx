"use client";

import { useMemo, useState } from "react";
import Screen from "@/components/Screen";
import ProfileHeader from "@/components/ProfileHeader";
import EventCard from "@/components/EventCard";
import EventForm from "@/components/EventForm";
import Modal from "@/components/Modal";
import { useStore } from "@/lib/store";
import { localDate } from "@/lib/format";
import type { SportEvent } from "@/lib/types";
import styles from "./events.module.css";

export default function EventsPage() {
  const { ready, events } = useStore();
  // Inactive by default: no filter selected means the full feed shows.
  const [showCross, setShowCross] = useState(false);
  const [showRun, setShowRun] = useState(false);
  const [editing, setEditing] = useState<SportEvent | null>(null);
  const [adding, setAdding] = useState(false);

  const list = useMemo(() => {
    if (!ready) return [];
    const all = !showCross && !showRun;
    return [...events]
      .filter((e) => all || (e.kind === "workout" ? showCross : showRun))
      .sort((a, b) => localDate(b.date).getTime() - localDate(a.date).getTime());
  }, [ready, events, showCross, showRun]);

  return (
    <Screen>
      <ProfileHeader />

      <div className={styles.toggles}>
        <button
          className={`${styles.toggle} ${styles.cross} ${showCross ? styles.on : ""}`}
          onClick={() => setShowCross((v) => !v)}
        >
          CROSSFIT
        </button>
        <button
          className={`${styles.toggle} ${styles.run} ${showRun ? styles.on : ""}`}
          onClick={() => setShowRun((v) => !v)}
        >
          RUN
        </button>
      </div>

      {!ready ? (
        <p className="muted" style={{ padding: "40px 4px" }}>Loading…</p>
      ) : list.length === 0 ? (
        <p className="muted" style={{ padding: "40px 4px" }}>
          No events match this filter.
        </p>
      ) : (
        list.map((ev) => (
          <EventCard key={ev.id} event={ev} onClick={() => setEditing(ev)} />
        ))
      )}

      <button className={styles.fab} onClick={() => setAdding(true)}>
        Log Event
      </button>

      <Modal open={adding} onClose={() => setAdding(false)}>
        <EventForm onDone={() => setAdding(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <EventForm initial={editing} onDone={() => setEditing(null)} />
        )}
      </Modal>
    </Screen>
  );
}
