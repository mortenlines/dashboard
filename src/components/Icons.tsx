/**
 * Hand-rolled inline icons. Avoids dragging in an icon library for a small,
 * stable set. Stroke uses currentColor so icons inherit text color.
 */

type IconProps = { size?: number; className?: string };

const base = (size = 16, className?: string) =>
  ({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  });

export function IconPlus({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconEdit({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function IconTrash({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconChevronUp({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}

export function IconChevronDown({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconGrip({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="9" cy="6" r="0.8" fill="currentColor" />
      <circle cx="9" cy="12" r="0.8" fill="currentColor" />
      <circle cx="9" cy="18" r="0.8" fill="currentColor" />
      <circle cx="15" cy="6" r="0.8" fill="currentColor" />
      <circle cx="15" cy="12" r="0.8" fill="currentColor" />
      <circle cx="15" cy="18" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function IconCheck({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconX({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconSun({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function IconMoon({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function IconSpinner({ size, className }: IconProps) {
  return (
    <svg {...base(size, className)} className={`animate-spin ${className ?? ""}`}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
