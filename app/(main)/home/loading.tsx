import { Skeleton } from "lib/ui/skeleton";
import { cn } from "lib/utils";
import { HomeLoadingSkeletonProps } from "./types";

export default function HomeLoading({ className }: HomeLoadingSkeletonProps) {
  return (
    <div className={cn("min-h-screen bg-[#0a0a0a] relative overflow-hidden", className)}>
      {/* Simplified background for loading state */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 opacity-60"></div>

      {/* Navigation skeleton */}
      <nav className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-2xl border-b border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-xl bg-slate-800/50" />
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-6 w-32 bg-slate-800/50" />
                <Skeleton className="h-3 w-12 bg-slate-800/50" />
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-10">
              <Skeleton className="h-4 w-12 bg-slate-800/50" />
              <Skeleton className="h-4 w-12 bg-slate-800/50" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section skeleton */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-24 sm:pb-32">
          <div className="text-center">
            <div className="flex justify-center mb-12">
              <Skeleton className="h-8 w-48 rounded-full bg-slate-800/50" />
            </div>
            <div className="mb-12 space-y-4">
              <Skeleton className="h-20 w-3/4 mx-auto bg-slate-800/50" />
              <Skeleton className="h-20 w-1/2 mx-auto bg-slate-800/50" />
            </div>
            <div className="space-y-2 max-w-4xl mx-auto">
              <Skeleton className="h-6 w-full bg-slate-800/50" />
              <Skeleton className="h-6 w-3/4 mx-auto bg-slate-800/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Features section skeleton */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <Skeleton className="h-12 w-96 mx-auto bg-slate-800/50" />
            <Skeleton className="h-6 w-2/3 mx-auto bg-slate-800/50" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6"
              >
                <div className="mb-6">
                  <Skeleton className="w-14 h-14 rounded-xl bg-slate-800/50" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-4 bg-slate-800/50" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-slate-800/50" />
                  <Skeleton className="h-4 w-5/6 bg-slate-800/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat section skeleton */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <Skeleton className="h-10 w-48 mx-auto bg-slate-800/50" />
            <Skeleton className="h-6 w-2/3 mx-auto bg-slate-800/50" />
          </div>

          {/* Chat interface skeleton */}
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-96 w-full bg-slate-900/95 border border-slate-800/50 rounded-xl" />
            <div className="max-w-2xl mx-auto">
              <Skeleton className="h-32 w-full bg-slate-900/95 border border-slate-800/50 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
