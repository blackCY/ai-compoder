"use client";

import { useState } from "react";
import { consumeSSE } from "@/lib/utils/stream";
import { post } from "@/lib/request";
import { Stage } from "@/lib/services/pipeline/types";
import { StageUsage } from "@/app/actions/pipeline/types";
import { SSEDeltaData, SSEFinalData, SSEErrorData } from "@/lib/store/pipeline/types";

interface UseStageRunOptions {
  pipelineId: string;
  stage: Stage;
}

export function useStageRun(options: UseStageRunOptions) {
  const [result, setResult] = useState<string | Record<string, unknown> | null>(null);
  const [usage, setUsage] = useState<StageUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = async (input: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      await consumeSSE(
        () =>
          post("/api/pipeline/stage/run", {
            pipelineId: options.pipelineId,
            stageId: options.stage.stage_id,
            input,
          }, { timeout: undefined }),
        {
          onDelta: data => {
            const snapshot = (data as SSEDeltaData).snapshot as string | Record<string, unknown>;
            setResult(snapshot);
          },
          onFinal: data => {
            const final = (data as SSEFinalData).final as string | Record<string, unknown>;
            setResult(final);
            const meta = (data as SSEFinalData).meta;
            if (meta?.usage) {
              setUsage(meta.usage as StageUsage);
            }
          },
          onError: data => {
            const errorMsg = (data as SSEErrorData).error;
            setError(new Error(errorMsg));
          },
        }
      );
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setUsage(null);
    setError(null);
    setIsLoading(false);
  };

  return { run, result, usage, isLoading, error, reset };
}
