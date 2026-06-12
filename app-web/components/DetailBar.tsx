"use client";

import { useRouter } from "next/navigation";
import { Back } from "./Icons";
import styles from "./DetailBar.module.css";

export default function DetailBar({
  title,
  right,
}: {
  title?: string;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className={styles.bar}>
      <button className={styles.back} onClick={() => router.back()} aria-label="Back">
        <Back width={22} height={22} />
      </button>
      {title && <h1 className={`display ${styles.title}`}>{title}</h1>}
      <div className={styles.right}>{right}</div>
    </div>
  );
}
