"use client";

import Image from "next/image";
import { useStore } from "@/lib/store";
import { LocationArrow } from "./Icons";
import styles from "./ProfileHeader.module.css";

export default function ProfileHeader({ compact = false }: { compact?: boolean }) {
  const { athlete, events, ready } = useStore();
  const count = ready ? events.length : athlete?.loggedEvents ?? 0;
  const name = athlete?.name ?? "Rob Myers";
  const box = athlete?.box ?? "CrossFit Ridge City";
  const location = athlete?.location ?? "Jonesboro, AR";

  return (
    <header className={`${styles.card} ${compact ? styles.compact : ""}`}>
      <div className={styles.avatar}>
        <Image src="/avatar.jpg" alt={name} width={88} height={88} priority />
      </div>
      <div className={styles.meta}>
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.box}>{box}</p>
        {!compact && (
          <p className={styles.loc}>
            {location}{" "}
            <LocationArrow width={15} height={15} style={{ color: "var(--color-white)" }} />
          </p>
        )}
      </div>
      <div className={styles.count}>
        <span className={`display num ${styles.countNum}`}>{count}</span>
        <span className={styles.countLabel}>Logged Events</span>
      </div>
    </header>
  );
}
