import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  gradient?: "blue-green" | "green" | "orange";
}

const gradients = {
  "blue-green": "from-[var(--info)] to-[var(--accent)]",
  green: "from-[var(--accent-dim)] to-[var(--accent)]",
  orange: "from-[var(--warning)] to-orange-500",
};

const sizes = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-16 h-16 text-2xl",
  xl: "w-24 h-24 text-4xl",
};

export function Avatar({
  name,
  size = "md",
  className,
  gradient = "blue-green",
}: AvatarProps) {
  const initial = name.charAt(0);

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-black flex-shrink-0",
        gradients[gradient],
        sizes[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
