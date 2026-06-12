"use client";

import type { SportEvent } from "@/lib/types";
import { longDateTime } from "@/lib/format";
import styles from "./EventCard.module.css";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

export default function EventCard({
  event,
  onClick,
  style,
}: {
  event: SportEvent;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const isRun = event.kind === "run";
  const isWalk = event.kind === "walk";
  const badge = isWalk ? "WALK" : isRun ? "RUN" : "CROSSFIT";
  const badgeClass = isRun || isWalk ? styles.badgeRun : styles.badgeCross;

  return (
    <button
      type="button"
      className={`${styles.card} rise`}
      onClick={onClick}
      style={style}
      data-kind={event.kind}
    >
      <div className={styles.head}>
        <h3 className={`display ${styles.title}`}>{event.name}</h3>
        <span className={`${styles.badge} ${badgeClass}`}>{badge}</span>
      </div>
      <p className={styles.date}>{longDateTime(event.date)}</p>

      {event.location && <p className={`display ${styles.location}`}>{event.location}</p>}

      <div className={styles.body}>
        <div className={styles.stats}>
          {isRun || isWalk ? (
            <>
              {event.movingTime && <Stat label="Time" value={event.movingTime} />}
              {event.pace && <Stat label="Avg Pace" value={event.pace} />}
              {event.calories != null && <Stat label="Cals" value={String(event.calories)} />}
              {event.elevationGain != null && (
                <Stat label="Elevation Gain" value={`${event.elevationGain} ft`} />
              )}
            </>
          ) : (
            <>
              {event.movingTime && <Stat label="Time" value={event.movingTime} />}
              {event.maxHeartRate != null && (
                <Stat label="Max Heart Rate" value={String(event.maxHeartRate)} />
              )}
              {event.calories != null && <Stat label="Cals" value={String(event.calories)} />}
              {event.avgHeartRate != null && (
                <Stat label="Average Heart Rate" value={String(event.avgHeartRate)} />
              )}
            </>
          )}
        </div>

        {(isRun || isWalk) && event.distance != null && (
          <div className={styles.distance}>
            <span className={`display ${styles.distanceNum}`}>{event.distance}</span>
            <span className={styles.distanceUnit}>miles</span>
          </div>
        )}
      </div>

      {event.description && <p className={styles.desc}>{event.description}</p>}
    </button>
  );
}
