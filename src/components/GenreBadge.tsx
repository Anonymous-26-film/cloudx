import { cn } from "../lib/utils";

interface GenreBadgeProps {
  name: string;
  className?: string;
  onClick?: () => void;
}

export function GenreBadge({ name, className, onClick }: GenreBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        "bg-white/10 text-foreground border border-white/20",
        "transition-colors duration-200",
        onClick && "cursor-pointer hover:bg-primary hover:border-primary",
        className
      )}
    >
      {name}
    </span>
  );
}
