import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 24, height: 24, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const, ...p,
});

/** Events — clipboard / log */
export const EventsIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="4" width="14" height="17" rx="2.5" />
    <path d="M9 4.5h6V3H9z" />
    <path d="M8.5 10h7M8.5 14h7M8.5 17.5h4" />
  </svg>
);

/** Train — kettlebell */
export const TrainIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 8.2a3 3 0 1 1 6 0" />
    <path d="M8.4 8.6C6.4 9.8 5 12.2 5 15c0 2.6 1.4 4 3.4 4h7.2c2 0 3.4-1.4 3.4-4 0-2.8-1.4-5.2-3.4-6.4" />
  </svg>
);

/** Progress — line chart */
export const ProgressIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 5v15h16" />
    <path d="M7 15l3.5-4 3 2.2L20 7" />
  </svg>
);

/** Account — person */
export const AccountIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5.5 20c.6-3.6 3.2-5.6 6.5-5.6s5.9 2 6.5 5.6" />
  </svg>
);

export const StopwatchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="13.5" r="7" />
    <path d="M12 13.5V9.5M9.5 2.6h5M19 7l1.4-1.4" />
  </svg>
);

export const Chevron = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const Back = (p: P) => (
  <svg {...base(p)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const Plus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const LocationArrow = (p: P) => (
  <svg {...base({ strokeWidth: 1.6, ...p })}>
    <path d="M20 4L4 11l7 2 2 7z" />
  </svg>
);

export const Dots = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

export const Grip = (p: P) => (
  <svg {...base({ strokeWidth: 0, ...p })} fill="currentColor" stroke="none">
    <circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" />
    <circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" />
    <circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" />
  </svg>
);
