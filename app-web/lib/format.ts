const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** Parse an ISO date string as a *local* calendar date (no TZ shift). */
export function localDate(iso: string): Date {
  const d = iso.slice(0, 10).split("-").map(Number);
  const t = iso.slice(11);
  if (t) {
    const [h, m, s] = t.split(":").map(Number);
    return new Date(d[0], d[1] - 1, d[2], h || 0, m || 0, s || 0);
  }
  return new Date(d[0], d[1] - 1, d[2]);
}

/** "Saturday, May 23, 2026" */
export function longDate(iso: string): string {
  const d = localDate(iso);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "May 26, 2026, 5:35:21 PM" */
export function longDateTime(iso: string): string {
  const d = localDate(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ${h}:${mm}:${ss} ${ampm}`;
}

/** Strava "Time" field — minutes.seconds, e.g. 1587s -> "26.27" */
export function minDotSec(seconds?: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}.${String(s).padStart(2, "0")}`;
}

export const YYYYMMDD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export { MONTHS, WEEKDAYS };
