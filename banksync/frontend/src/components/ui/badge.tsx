import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        STATUS_COLORS[status] || "bg-gray-100 text-gray-700",
        className
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
