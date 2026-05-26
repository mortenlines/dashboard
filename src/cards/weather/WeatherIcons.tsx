/**
 * Eight weather glyphs mapped from yr.no's `symbol_code` values. Inline SVGs
 * inherit currentColor so they pick up the surrounding text styles.
 */

type Props = { size?: number; className?: string };

const wrap = (size = 24, className?: string) =>
  ({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  });

function Sun({ size, className }: Props) {
  return (
    <svg {...wrap(size, className)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function Moon({ size, className }: Props) {
  return (
    <svg {...wrap(size, className)}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function PartlyCloudyDay({ size, className }: Props) {
  return (
    <svg {...wrap(size, className)}>
      <circle cx="8" cy="9" r="3" />
      <path d="M8 2v1M3 9h1M4.5 5.5l.7.7M11.5 5.5l-.7.7" />
      <path d="M7 18h10a3 3 0 0 0 0-6 4 4 0 0 0-7.5-1.5" />
    </svg>
  );
}

function PartlyCloudyNight({ size, className }: Props) {
  return (
    <svg {...wrap(size, className)}>
      <path d="M11 4.5a4 4 0 0 0 4 5 4 4 0 1 1-4-5z" />
      <path d="M7 19h10a3 3 0 0 0 0-6 4 4 0 0 0-6.2-2.5" />
    </svg>
  );
}

function Cloudy({ size, className }: Props) {
  return (
    <svg {...wrap(size, className)}>
      <path d="M6 18h12a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 6 18z" />
    </svg>
  );
}

function Rain({ size, className }: Props) {
  return (
    <svg {...wrap(size, className)}>
      <path d="M6 15h12a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 6 15z" />
      <path d="M9 19v2M13 19v2M17 19v2" />
    </svg>
  );
}

function Snow({ size, className }: Props) {
  return (
    <svg {...wrap(size, className)}>
      <path d="M6 15h12a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 6 15z" />
      <circle cx="9" cy="20" r="0.6" fill="currentColor" />
      <circle cx="13" cy="20" r="0.6" fill="currentColor" />
      <circle cx="17" cy="20" r="0.6" fill="currentColor" />
    </svg>
  );
}

function Fog({ size, className }: Props) {
  return (
    <svg {...wrap(size, className)}>
      <path d="M6 13h12a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 6 13z" />
      <path d="M3 17h14M5 21h12" />
    </svg>
  );
}

function Storm({ size, className }: Props) {
  return (
    <svg {...wrap(size, className)}>
      <path d="M6 15h12a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 6 15z" />
      <path d="m13 16-3 4h3l-2 3" />
    </svg>
  );
}

/** Pick an icon from a yr.no `symbol_code`. */
export function weatherIconFor(
  symbolCode: string
): (props: Props) => React.JSX.Element {
  const code = symbolCode.toLowerCase();

  if (code.startsWith("thunder") || code.includes("rainand")) return Storm;
  if (code.startsWith("fog")) return Fog;
  if (
    code.startsWith("snow") ||
    code.startsWith("lightsnow") ||
    code.startsWith("heavysnow") ||
    code.startsWith("sleet") ||
    code.startsWith("lightsleet") ||
    code.startsWith("heavysleet")
  ) {
    return Snow;
  }
  if (code.includes("rain") || code.includes("shower")) return Rain;
  if (code.startsWith("cloudy")) return Cloudy;
  if (code.startsWith("partlycloudy")) {
    return code.endsWith("_night") ? PartlyCloudyNight : PartlyCloudyDay;
  }
  if (code.startsWith("fair") || code.startsWith("clearsky")) {
    return code.endsWith("_night") ? Moon : Sun;
  }
  return Cloudy;
}

/** A human-friendly label for a yr.no symbol code. */
export function weatherLabelFor(symbolCode: string): string {
  const code = symbolCode.toLowerCase();
  if (code.startsWith("thunder")) return "Thunderstorm";
  if (code.startsWith("fog")) return "Fog";
  if (code.startsWith("heavysnow")) return "Heavy snow";
  if (code.startsWith("lightsnow")) return "Light snow";
  if (code.startsWith("snow")) return "Snow";
  if (code.startsWith("sleet")) return "Sleet";
  if (code.startsWith("heavyrain")) return "Heavy rain";
  if (code.startsWith("lightrain")) return "Light rain";
  if (code.includes("rain") || code.includes("shower")) return "Rain";
  if (code.startsWith("cloudy")) return "Cloudy";
  if (code.startsWith("partlycloudy")) return "Partly cloudy";
  if (code.startsWith("fair")) return "Fair";
  if (code.startsWith("clearsky")) {
    return code.endsWith("_night") ? "Clear night" : "Clear sky";
  }
  return symbolCode;
}
