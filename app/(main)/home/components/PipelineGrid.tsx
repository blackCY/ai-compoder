"use client";

import { usePipelines } from "@/lib/server-store";
import { PipelineCard } from "./PipelineCard";
import { PipelineCreateCard } from "./PipelineCreateCard";
import dynamic from "next/dynamic";

export const PipelineGrid = () => {
  const { data: pipelines, isLoading, error } = usePipelines();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[340px] rounded-2xl border border-white/5 bg-white/5 p-8 animate-pulse"
          >
            <div className="h-12 w-12 rounded-xl bg-white/10 mb-6" />
            <div className="h-6 w-3/4 rounded-lg bg-white/10 mb-3" />
            <div className="h-16 w-full rounded-lg bg-white/5 mb-8" />
            <div className="h-6 w-20 rounded-full bg-white/10 mb-4" />
            <div className="flex gap-3 border-t border-white/5 pt-4">
              <div className="flex-1 h-10 rounded-lg bg-white/10" />
              <div className="w-28 h-10 rounded-lg bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400">
        Failed to load AI capabilities. Please try again later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pipelines?.map((pipeline, index) => (
        <PipelineCard key={pipeline.id} pipeline={pipeline} index={index} />
      ))}
      <PipelineCreateCard index={pipelines?.length || 0} />
    </div>
  );
};

/**
 * PipelineGrid 的无 SSR 版本
 * 使用 next/dynamic 的 ssr: false 选项，确保组件只在客户端渲染
 * 避免构建时执行 TanStack Query 的 queryFn
 */
export const PipelineGridNoSSR = dynamic(
  () => Promise.resolve(PipelineGrid),
  {
    ssr: false,
  }
);
