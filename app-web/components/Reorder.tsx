"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Grip } from "./Icons";
import styles from "./Reorder.module.css";

const GAP = 16;

/**
 * Touch + mouse vertical drag-to-reorder. Drag starts from the grip handle so
 * it never fights the page scroll. Items can have different heights.
 */
export default function Reorder({
  order,
  onReorder,
  render,
}: {
  order: string[];
  onReorder: (next: string[]) => void;
  render: (id: string, dragging: boolean) => React.ReactNode;
}) {
  const [local, setLocal] = useState(order);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dy, setDy] = useState(0);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const startY = useRef(0);
  const localRef = useRef(local);
  localRef.current = local;

  // keep in sync when the store order changes externally
  useEffect(() => {
    if (!dragId) setLocal(order);
  }, [order, dragId]);

  const onMove = useCallback(
    (clientY: number) => {
      setDragId((id) => {
        if (!id) return id;
        setLocal((cur) => {
          const idx = cur.indexOf(id);
          const delta = clientY - startY.current;
          if (delta > 0 && idx < cur.length - 1) {
            const nextEl = refs.current[cur[idx + 1]];
            if (nextEl && delta > nextEl.offsetHeight / 2 + GAP / 2) {
              const next = [...cur];
              [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
              startY.current += nextEl.offsetHeight + GAP;
              return next;
            }
          } else if (delta < 0 && idx > 0) {
            const prevEl = refs.current[cur[idx - 1]];
            if (prevEl && -delta > prevEl.offsetHeight / 2 + GAP / 2) {
              const next = [...cur];
              [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
              startY.current -= prevEl.offsetHeight + GAP;
              return next;
            }
          }
          return cur;
        });
        setDy(clientY - startY.current);
        return id;
      });
    },
    []
  );

  useEffect(() => {
    if (!dragId) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      onMove(e.clientY);
    };
    const up = () => {
      setDragId(null);
      setDy(0);
      onReorder(localRef.current);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragId, onMove, onReorder]);

  function start(id: string, clientY: number) {
    startY.current = clientY;
    setDy(0);
    setDragId(id);
  }

  return (
    <div className={styles.list}>
      {local.map((id) => {
        const dragging = id === dragId;
        return (
          <div
            key={id}
            ref={(el) => {
              refs.current[id] = el;
            }}
            className={`${styles.item} ${dragging ? styles.dragging : ""}`}
            style={dragging ? { transform: `translateY(${dy}px)` } : undefined}
          >
            <button
              className={styles.grip}
              aria-label="Drag to reorder"
              onPointerDown={(e) => {
                e.preventDefault();
                start(id, e.clientY);
              }}
            >
              <Grip width={20} height={20} />
            </button>
            {render(id, dragging)}
          </div>
        );
      })}
    </div>
  );
}
