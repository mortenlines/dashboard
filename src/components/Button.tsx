import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-accent text-bg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed",
  secondary:
    "bg-surface text-text border border-border hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-muted hover:text-text hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed",
  danger:
    "bg-transparent text-negative hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** Compact size for inline / icon controls. */
  compact?: boolean;
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", compact = false, className = "", children, ...rest },
  ref
) {
  const sizing = compact ? "h-7 px-2.5 text-xs" : "h-9 px-3.5 text-sm";
  return (
    <button
      ref={ref}
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors ${sizing} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
});
