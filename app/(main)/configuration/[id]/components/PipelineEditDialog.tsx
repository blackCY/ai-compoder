"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUpdatePipeline } from "@/lib/server-store";
import { toast } from "sonner";

interface PipelineEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string;
  initialName: string;
  initialDescription: string | null;
  onSuccess?: (newName: string, newDescription: string | null) => void;
}

export function PipelineEditDialog({
  isOpen,
  onClose,
  pipelineId,
  initialName,
  initialDescription,
  onSuccess,
}: PipelineEditDialogProps) {
  const { mutateAsync: updatePipeline, isPending: isSaving } = useUpdatePipeline();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription || "");

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Pipeline name is required");
      return;
    }

    try {
      await updatePipeline({
        id: pipelineId,
        data: {
          name,
          description: description || null,
        },
      });

      toast.success("Pipeline updated successfully");
      onSuccess?.(name, description || null);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update pipeline");
    }
  };

  const hasChanges = name !== initialName || description !== (initialDescription || "");

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900 to-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Edit Pipeline</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Pipeline Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Enter pipeline name"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[120px]"
              placeholder="Enter pipeline description"
            />
          </div>
        </div>

        <DialogFooter className="bg-black/20 -mx-6 -mb-6 p-6 mt-0">
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 min-w-[100px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
