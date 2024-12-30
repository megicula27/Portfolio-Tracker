import { Loader2 } from "lucide-react";

export function StockLoading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 h-64">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-medium text-muted-foreground">
        Loading stocks...
      </p>
      <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
        <div className="w-full h-full bg-primary origin-left animate-[shimmer_1.5s_infinite]" />
      </div>
    </div>
  );
}
