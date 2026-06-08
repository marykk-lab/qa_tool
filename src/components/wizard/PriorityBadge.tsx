import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  P0: "bg-red-950/60 text-red-400 border-red-800",
  P1: "bg-amber-950/60 text-amber-400 border-amber-800",
  P2: "bg-zinc-800/60 text-zinc-400 border-zinc-700",
};

const PRIORITY_LABELS: Record<string, string> = {
  P0: "P0 Critical",
  P1: "P1 Important",
  P2: "P2 Nice to have",
};

export function PriorityBadge({ priority }: { priority: "P0" | "P1" | "P2" }) {
  const style = PRIORITY_STYLES[priority] ?? "bg-zinc-800/60 text-zinc-400 border-zinc-700";
  return (
    <Badge
      variant="outline"
      className={cn("text-sm font-normal", style)}
      aria-label={PRIORITY_LABELS[priority] ?? priority}
    >
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}
