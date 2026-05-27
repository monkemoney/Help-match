"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] w-full";

    const variants = {
      primary: "bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)]",
      secondary:
        "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]",
      danger: "bg-[var(--danger)] text-white hover:opacity-90",
      warning: "bg-[var(--warning)] text-black hover:opacity-90",
      ghost:
        "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-5 py-3.5 text-base",
      lg: "px-6 py-4.5 text-lg rounded-2xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
