import { cn } from "@/lib/utils";

interface MobileShellProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileShell({ children, className }: MobileShellProps) {
  return (
    <div className="min-h-svh flex flex-col bg-[var(--bg)] max-w-[430px] mx-auto relative overflow-hidden">
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
