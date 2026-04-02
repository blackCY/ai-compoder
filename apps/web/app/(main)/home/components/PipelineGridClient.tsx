"use client";

import { Pipeline } from "lib/services/pipeline/types";
import { PipelineCard } from "./PipelineCard";
import { PipelineCreateCard } from "./PipelineCreateCard";
import { useQuery } from "@tanstack/react-query";
import { getPipelines } from "lib/services/pipeline/pipelineService";

interface PipelineGridClientProps {
  initialPipelines: Pipeline[];
}

/**
 * PipelineGrid Client Component
 * Handles client-side interactions and real-time updates
 */
export function PipelineGridClient({ initialPipelines }: PipelineGridClientProps) {
  const {
    data: pipelines,
    isLoading,
    error,
  } = useQuery<Pipeline[]>({
    queryKey: ["pipelines"],
    queryFn: getPipelines,
    // 这里先用初始值进行渲染，同时在挂载时刷新一遍数据，并且设置 5 分钟后数据过期
    initialData: initialPipelines,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: "always",
  });

  if (isLoading && !pipelines) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
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
}
