"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Stage } from "lib/services/pipeline/types";
import { Button } from "lib/ui/button";
import { Input } from "lib/ui/input";
import { SystemPromptEditor } from "./StageEditor/SystemPromptEditor";
import { ResourceEditor } from "./StageEditor/ResourceEditor";
import { SchemaEditor } from "./StageEditor/SchemaEditor";

interface StageDetailPanelProps {
  stage: Stage | null;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (data: Partial<Stage>) => void | Promise<void>;
}

export function StageDetailPanel({
  stage,
  isSaving = false,
  onClose,
  onSave,
}: StageDetailPanelProps) {
  const [formData, setFormData] = useState<Partial<Stage>>(stage || {});

  const isNew = !formData?.id;

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => !isSaving && onClose()}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-emerald-500/10 shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex flex-col animate-in slide-in-from-right duration-300 ease-in-out">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        {/* Header */}
        <div className="flex items-center justify-between bg-emerald-950/30 border-b border-emerald-500/10 p-6">
          <div className="flex-1">
            <Input
              value={formData.stage_id || ""}
              onChange={e => setFormData(prev => ({ ...prev, stage_id: e.target.value }))}
              disabled={isSaving}
              className="text-xl font-bold bg-emerald-950/20 border-emerald-500/10 text-white rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500/30"
              placeholder="Stage ID (e.g., generate-code)"
            />
            <div className="absolute -top-6 left-0 text-[10px] font-bold text-emerald-400 uppercase tracking-widest opacity-50">
              {isNew ? "New Stage" : "Editing Stage"}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSaving}
              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* System Prompt */}
          <SystemPromptEditor
            value={formData.system_prompt || ""}
            onChange={val => setFormData(prev => ({ ...prev, system_prompt: val }))}
            disabled={isSaving}
          />

          {/* Schema */}
          <SchemaEditor
            value={formData.schema ?? null}
            onChange={val => setFormData(prev => ({ ...prev, schema: val }) as Partial<Stage>)}
            disabled={isSaving}
          />

          {/* Resource */}
          <ResourceEditor
            value={formData.resources?.data}
            onChange={val =>
              setFormData(prev => ({
                ...prev,
                resources: {
                  ...prev.resources,
                  data: val,
                } as Stage["resources"],
              }))
            }
            disabled={isSaving}
          />
        </div>

        {/* Footer */}
        <div className="bg-emerald-950/20 border-t border-emerald-500/10 p-6 backdrop-blur-md">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl px-8 font-semibold shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isNew ? (
                "Create Stage"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
