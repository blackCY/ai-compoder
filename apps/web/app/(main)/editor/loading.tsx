import { Skeleton } from "lib/ui/skeleton";
import { cn } from "lib/utils";

interface LoadingProps {
  className?: string;
}

const CODE_LINE_WIDTHS = [62, 78, 69, 84, 73, 91, 66, 88, 75, 95, 71, 82, 68, 86, 79];

export default function EditorLoading({ className }: LoadingProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#0a0b0e] text-[#e1e3e8] overflow-hidden",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Main Layout Grid - Same as EditorLayout */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "240px 1fr 1fr",
          gridTemplateRows: "50px 1fr",
          height: "calc(100vh - 120px)",
        }}
      >
        {/* Header */}
        <header className="col-span-full bg-[#111216] border-b border-[#23252b] flex items-center justify-between px-5">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-24 bg-[#23252b]" />
            <Skeleton className="h-5 w-16 bg-[#ffbe0b]/20" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-20 bg-[#23252b] rounded-full" />
            <Skeleton className="h-4 w-16 bg-[#23252b] rounded-full" />
          </div>
        </header>

        {/* Sidebar */}
        <div className="bg-[#0d0e11] border-r border-[#23252b] p-4 space-y-3">
          {/* File list skeletons */}
          {[...Array(6)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-full bg-[#23252b]/50 rounded" />
            </div>
          ))}
          {/* Save button skeleton */}
          <div className="pt-4">
            <Skeleton className="h-9 w-full bg-[#23252b]/50 rounded-lg" />
          </div>
        </div>

        {/* Code Editor */}
        <div className="bg-[#0d0e11] border-r border-[#23252b]">
          {/* Editor header */}
          <div className="h-10 border-b border-[#23252b] flex items-center px-4">
            <Skeleton className="h-4 w-24 bg-[#23252b]/50" />
          </div>
          {/* Code content */}
          <div className="p-4 space-y-2">
            {[...Array(15)].map((_, index) => (
              <Skeleton
                key={index}
                className="h-4 w-full bg-[#23252b]/30"
                style={{ width: `${CODE_LINE_WIDTHS[index % CODE_LINE_WIDTHS.length]}%` }}
              />
            ))}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-[#0d0e11]">
          {/* Preview header */}
          <div className="h-10 border-b border-[#23252b] flex items-center justify-between px-4">
            <Skeleton className="h-4 w-20 bg-[#23252b]/50" />
            <Skeleton className="h-6 w-16 bg-[#23252b]/50 rounded" />
          </div>
          {/* Preview content */}
          <div className="p-6 space-y-4">
            {/* Simulated preview elements */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-1/2 mx-auto bg-[#23252b]/30" />
              <Skeleton className="h-4 w-3/4 mx-auto bg-[#23252b]/30" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-24 w-full bg-[#23252b]/20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
