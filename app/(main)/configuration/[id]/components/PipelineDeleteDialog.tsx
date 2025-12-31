"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeletePipeline } from "@/lib/server-store";

interface PipelineDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string;
  pipelineName: string;
}

export function PipelineDeleteDialog({
  isOpen,
  onClose,
  pipelineId,
  pipelineName,
}: PipelineDeleteDialogProps) {
  const router = useRouter();
  const { mutateAsync: deletePipeline, isPending: isDeleting } = useDeletePipeline();

  const handleConfirm = async () => {
    try {
      await deletePipeline(pipelineId);
      toast.success("Pipeline deleted successfully");
      router.push("/home#pipelines");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete pipeline");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-black border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white">Delete Pipeline</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="text-gray-300 py-4">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">"{pipelineName}"</span>? This action cannot be
          undone and will delete all associated stages.
        </DialogDescription>

        <DialogFooter className="bg-black/20 -mx-6 -mb-6 p-6 mt-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 min-w-[120px] text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Pipeline
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
