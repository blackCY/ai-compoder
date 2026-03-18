"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "lib/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "lib/ui/dialog";
import { useDeletePipeline } from "lib/serverStore";

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
      <DialogContent className="bg-[#0a0a0a]/95 border-emerald-500/10 text-white sm:max-w-[425px] backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white">删除配置</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="text-gray-300 py-4">
          确定要删除 <span className="text-white font-medium">&quot;{pipelineName}&quot;</span>
          吗？此操作无法撤销，将同时删除所有关联的阶段。
        </DialogDescription>

        <DialogFooter className="bg-black/20 -mx-6 -mb-6 p-6 mt-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isDeleting}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 min-w-[120px] text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                删除中...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                确认删除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
