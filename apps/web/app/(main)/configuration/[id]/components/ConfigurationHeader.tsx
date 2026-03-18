"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Pipeline } from "lib/services/pipeline/types";
import { Button } from "lib/ui/button";
import { PipelineEditDialog } from "./PipelineEditDialog";
import { PipelineDeleteDialog } from "./PipelineDeleteDialog";

interface ConfigurationHeaderProps {
  pipeline: Pipeline;
}

export function ConfigurationHeader({ pipeline }: ConfigurationHeaderProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-6 py-4">
      {/* Left: Title Section with Back */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => router.back()}
          className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {pipeline.name}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400">Config</span>
            </div>
          </div>
          {pipeline.description && (
            <p className="text-sm text-gray-500 line-clamp-2 max-w-xl">
              {pipeline.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
          className="h-9 px-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
        >
          <Edit2 className="h-4 w-4" />
          <span className="hidden sm:inline">编辑</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="h-9 px-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">删除</span>
        </Button>
      </div>

      <PipelineEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        pipelineId={pipeline.id}
        initialName={pipeline.name}
        initialDescription={pipeline.description}
      />

      <PipelineDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        pipelineId={pipeline.id}
        pipelineName={pipeline.name}
      />
    </div>
  );
}
