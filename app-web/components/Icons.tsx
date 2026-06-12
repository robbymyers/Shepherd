import type { CSSProperties, SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

/**
 * Icons come from the exported Figma assets in /public/icons.
 * Shapes are applied as CSS masks and tinted with `currentColor`, so the
 * same file serves every state/theme: e.g. the tab bar colors icons via
 * `--color-white` (inactive, #EEEEEE in dark) and `--color-green`
 * (active, #BBD87A) — identical to the -default / -active SVG exports.
 */
type MaskProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
};

function maskIcon(src: string) {
  return function Icon({ width = 24, height = 24, className, style }: MaskProps) {
    const mask: CSSProperties = {
      display: "inline-block",
      flexShrink: 0,
      width,
      height,
      backgroundColor: "currentColor",
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "contain",
      maskSize: "contain",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      ...style,
    };
    return <span aria-hidden className={className} style={mask} />;
  };
}

/** Events — clipboard / log (21×27) */
export const EventsIcon = maskIcon("/icons/icon-events-default.svg");

/** Train — kettlebell (20×26) */
export const TrainIcon = maskIcon("/icons/icon-kettlebell-default.svg");

/** Progress — line chart (22×28) */
export const ProgressIcon = maskIcon("/icons/icon-progress-default.svg");

/** Account — person (24×27) */
export const AccountIcon = maskIcon("/icons/icon-profile-default.svg");

export const StopwatchIcon = maskIcon("/icons/icon-stopwatch-default.svg");

export const Chevron = maskIcon("/icons/icon-forwardarrow-white.svg");

export const Back = maskIcon("/icons/icon-backarrow-white.svg");

export const Plus = maskIcon("/icons/icon-plus-white.svg");

export const LocationArrow = maskIcon("/icons/icon-location-white.svg");

export const ShoeIcon = maskIcon("/icons/icon-shoe-default.svg");

/* No exported assets for these two — still drawn inline. */

export const Dots = (p: P) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="6" cy="12" r="1.3" fill="currentColor" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    <circle cx="18" cy="12" r="1.3" fill="currentColor" />
  </svg>
);

export const Grip = (p: P) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
    <circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" />
    <circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" />
    <circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" />
  </svg>
);
