import { Skeleton } from "lib/ui/skeleton";
import { cn } from "lib/utils";

interface LoadingProps {
  className?: string;
}

export default function ConfigurationLoading({ className }: LoadingProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8", className)}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-8 w-48 bg-white/10" />
              <Skeleton className="h-12 w-80 bg-white/5" />
              <Skeleton className="h-5 w-96 bg-white/5" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-20 rounded-lg bg-white/10" />
              <Skeleton className="h-10 w-20 rounded-lg bg-white/10" />
              <Skeleton className="h-12 w-24 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>

        {/* Divider Skeleton */}
        <div className="h-px w-full bg-white/10" />

        {/* Stages Section Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24 bg-white/10" />
            <Skeleton className="h-6 w-20 rounded-full bg-white/5" />
          </div>

          {/* Canvas Skeleton */}
          <div className="h-[600px] rounded-2xl border border-white/5 bg-black/40">
            {/* Simulated Flow Canvas */}
            <div className="h-full p-6 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 w-full max-w-4xl">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-28 w-full rounded-xl bg-white/5" />
                    <Skeleton className="h-4 w-24 mx-auto bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
