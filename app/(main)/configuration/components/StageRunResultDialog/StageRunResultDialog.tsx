"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, XCircle, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStageRun } from "@/app/(main)/configuration/hooks/useStageRun";
import { TextResultViewer } from "./components/TextResultViewer";
import { ObjectResultViewer } from "./components/ObjectResultViewer";
import { UsageDisplay } from "./components/UsageDisplay";
import { Stage } from "@/lib/services/pipeline/types";

export interface StageRunResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  stage: Stage;
  onRunningStateChange?: (isRunning: boolean) => void;
}

export function StageRunResultDialog({
  open,
  onOpenChange,
  pipelineId,
  stage,
}: StageRunResultDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const { run, result, usage, isLoading, error, reset } = useStageRun({
    pipelineId,
    stage,
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setInputValue("");
    }
    onOpenChange(isOpen);
  };

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputValue.trim()) {
      run(inputValue);
    }
  };

  const hasSchema = !!stage.schema;
  const isTextResult = typeof result === "string";
  const isObjectResult = typeof result === "object" && result !== null;
  const hasInput = inputValue.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="!p-0 bg-black/80 border border-white/10 text-white !max-w-[95vw] !w-[700px] !h-[560px] overflow-hidden shadow-2xl rounded-2xl backdrop-blur-xl">
        <div className="h-full flex flex-col w-full overflow-hidden">
          {/* Header */}
          <div className="shrink-0 px-5 py-4 border-b border-white/10 bg-white/5 w-full">
            <div className="flex items-center justify-between gap-3 w-full min-w-0">
              {/* Stage Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white truncate">
                      {stage.stage_id}
                    </h2>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0",
                      isLoading
                        ? "bg-emerald-500/20 text-emerald-400"
                        : error
                        ? "bg-red-500/20 text-red-400"
                        : result
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-white/5 text-white/40"
                    )}>
                      {isLoading ? "Running" : error ? "Failed" : result ? "Complete" : "Ready"}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 truncate">
                    {isLoading ? "Executing stage..." : error ? error.message : result ? "Execution successful" : "Enter input to run"}
                  </p>
                </div>
              </div>

              {/* Input & Run */}
              <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => {
                    e.stopPropagation();
                    setInputValue(e.target.value);
                  }}
                  placeholder="Enter input..."
                  className={cn(
                    "w-48 px-3 py-2.5 rounded-lg bg-black/40 border text-sm",
                    "focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50",
                    "placeholder:text-white/30 text-white",
                    hasInput && !isLoading ? "border-white/10" : "border-white/5"
                  )}
                />
                <button
                  onClick={handleRun}
                  disabled={isLoading || !hasInput}
                  className={cn(
                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    "flex items-center gap-2 shrink-0",
                    hasInput && !isLoading
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run
                    </>
                  )}
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="shrink-0 mx-5 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-red-400 text-sm">Execution Error</span>
                  <p className="mt-0.5 text-sm text-red-300/80 break-words">{error.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result Display */}
          <div className="flex-1 min-h-0 p-5 w-full">
            <div className="h-full w-full rounded-lg overflow-hidden border border-white/10 bg-black/40 flex flex-col">
              <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  </div>
                  <span className="text-xs text-white/40 font-mono ml-2 truncate">
                    {hasSchema ? "output.json" : "output.txt"}
                  </span>
                </div>
                {isLoading && (
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse delay-100" />
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse delay-200" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0 bg-black/20 overflow-hidden">
                {hasSchema ? (
                  <ObjectResultViewer
                    data={(isObjectResult ? result : {}) as Record<string, unknown>}
                    isLoading={isLoading && !result}
                  />
                ) : (
                  <TextResultViewer
                    content={isTextResult ? result : ""}
                    isLoading={isLoading && !result}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer with Usage */}
          <div className="shrink-0 px-5 py-3 border-t border-white/10 bg-white/5 w-full">
            <UsageDisplay usage={usage} />
          </div>
        </div>

        <style>{`
          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
