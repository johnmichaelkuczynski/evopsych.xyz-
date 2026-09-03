import { Users } from "lucide-react";
import { useGetVisitorCount } from "@workspace/api-client-react";

export function VisitorCounter({ className = "" }: { className?: string }) {
  const { data } = useGetVisitorCount({
    query: {
      queryKey: ["visitors", "count"],
      refetchOnWindowFocus: false,
    },
  });

  if (data === undefined) return null;

  return (
    <div
      className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}
      data-testid="text-visitor-count"
    >
      <Users className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{data.uniqueVisitors.toLocaleString()} unique visitors</span>
    </div>
  );
}