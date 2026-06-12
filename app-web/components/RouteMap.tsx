"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./RouteMap.module.css";

export default function RouteMap({ route }: { route: [number, number][] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: LeafletMap | undefined;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      }).addTo(map);
      const accent =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-pink-alt")
          .trim() || "#fd3b60";
      const line = L.polyline(route, { color: accent, weight: 3 }).addTo(map);
      map.fitBounds(line.getBounds(), { padding: [20, 20] });
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [route]);

  return <div ref={ref} className={styles.map} />;
}
