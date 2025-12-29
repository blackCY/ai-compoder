"use client";

import { Handle, Position } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { Stage } from "@/lib/services/pipeline/types";

interface StageNodeProps {
  data: Stage & {
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
  };
}

export function StageNode({ data }: StageNodeProps) {
  const hasResource = !!data.resources;
  const hasSchema = !!data.schema;
  const promptPreview =
    data.system_prompt.slice(0, 50) + (data.system_prompt.length > 50 ? "..." : "");

  return (
    <div
      onClick={data.onClick}
      className="group relative cursor-pointer rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-5 shadow-2xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] hover:scale-[1.02] min-w-[220px]"
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
              <div
                className="flex h-7 px-2 items-center justify-center rounded-lg bg-blue-500/10 text-[10px] font-medium text-blue-400 ring-1 ring-blue-500/20 shadow-[0_0_10px_-2px_rgba(59,130,246,0.3)]"
                title="Has Resource"
              >
                resource
              </div>
            )}
            {hasSchema && (
              <div
                className="flex h-7 px-2 items-center justify-center rounded-lg bg-purple-500/10 text-[10px] font-medium text-purple-400 ring-1 ring-purple-500/20 shadow-[0_0_10px_-2px_rgba(168,85,247,0.3)]"
                title="Has Schema"
              >
                schema
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={data.onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 hover:text-white"
            title="Delete Stage"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Prompt Preview */}
      <div className="relative mt-2 text-xs text-gray-400/80 line-clamp-2 italic leading-relaxed">
        "{promptPreview}"
      </div>
    </div>
  );
}
