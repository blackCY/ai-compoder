"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2 } from "lucide-react";
import { Pipeline } from "@/lib/services/pipeline/types";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
      <div className="space-y-3 group relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Pipeline Configuration
        </div>
        <h1 className="text-5xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
          {pipeline.name}
        </h1>
        {pipeline.description ? (
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed font-medium">
            {pipeline.description}
          </p>
        ) : (
          <p className="text-sm italic text-gray-500 font-medium">No description provided</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-xl">
          <Button
            variant="ghost"
            onClick={() => setIsEditDialogOpen(true)}
            className="h-10 px-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl flex items-center gap-2 transition-all"
          >
            <Edit2 className="h-4.5 w-4.5" />
            <span className="font-medium">Edit</span>
          </Button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <Button
            variant="ghost"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-10 px-4 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2 transition-all"
          >
            <Trash2 className="h-4.5 w-4.5" />
            <span className="font-medium">Delete</span>
          </Button>
        </div>

        <button
          onClick={() => router.push("/")}
          className="h-12 px-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 group/back shadow-xl"
        >
          <span className="group-hover/back:-translate-x-1 transition-transform text-lg">←</span>
          Back Home
        </button>
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
