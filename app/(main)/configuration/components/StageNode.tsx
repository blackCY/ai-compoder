"use client";

import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Trash2, Play, Settings } from "lucide-react";
import { Stage } from "@/lib/services/pipeline/types";
import { StageRunResultDialog } from "./StageRunResultDialog/StageRunResultDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StageNodeProps {
  data: Stage & {
    pipelineId: string;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
  };
}

export function StageNode({ data }: StageNodeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasResource = !!data.resources;
  const hasSchema = !!data.schema;
  const promptPreview =
    data.system_prompt.slice(0, 50) + (data.system_prompt.length > 50 ? "..." : "");

  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-5 shadow-2xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] hover:scale-[1.02] min-w-[220px]"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-black"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-black"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="relative mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mt-2 text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
            {data.stage_id}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 ml-2">
          {/* Status Indicators */}
          <div className="flex gap-1.5">
            {hasResource && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex h-7 px-2 items-center justify-center rounded-lg bg-blue-500/10 text-[10px] font-medium text-blue-400 ring-1 ring-blue-500/20 shadow-[0_0_10px_-2px_rgba(59,130,246,0.3)]"
                  >
                    resource
                  </div>
                </TooltipTrigger>
                <TooltipContent>Has Resource</TooltipContent>
              </Tooltip>
            )}
            {hasSchema && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex h-7 px-2 items-center justify-center rounded-lg bg-purple-500/10 text-[10px] font-medium text-purple-400 ring-1 ring-purple-500/20 shadow-[0_0_10px_-2px_rgba(168,85,247,0.3)]"
                  >
                    schema
                  </div>
                </TooltipTrigger>
                <TooltipContent>Has Schema</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Configure Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={data.onClick}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-gray-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Open Configure Stage</TooltipContent>
          </Tooltip>

          {/* Run Stage Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
                className="flex h-7 min-w-7 px-2 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Run Stage</TooltipContent>
          </Tooltip>

          {/* Delete Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={data.onDelete}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 hover:text-white cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Delete Stage</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Prompt Preview */}
      <div className="relative mt-2 text-xs text-gray-400/80 line-clamp-2 italic leading-relaxed">
        {promptPreview}
      </div>

      {/* Stage Run Result Dialog */}
      <StageRunResultDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        pipelineId={data.pipelineId}
        stage={data}
      />
    </div>
  );
}
