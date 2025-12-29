"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePipeline } from "@/lib/server-store/hooks/usePipelines";
import { toast } from "sonner";

interface PipelineCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PipelineCreateDialog({ open, onOpenChange }: PipelineCreateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const createPipeline = useCreatePipeline();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const result = await createPipeline.mutateAsync({
        name: name.trim(),
        description: description.trim(),
      });
      
      toast.success("pipeline 创建成功");
      onOpenChange(false);
      setName("");
      setDescription("");
      
      // 跳转到配置页面
      router.push(`/configuration?id=${result.id}`);
    } catch (error) {
      console.error("Failed to create pipeline:", error);
      toast.error("创建失败，请稍后重试");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] border-white/10 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">新建 pipeline</DialogTitle>
            <DialogDescription className="text-gray-400">
              为您的新 AI 能力设置一个名称和描述。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">
                pipeline 名称 <span className="text-red-400">*</span>
              </label>
              <Input
                id="name"
                placeholder="例如：智能客服助手"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-300">
                描述
              </label>
              <Textarea
                id="description"
                placeholder="简要描述这个 pipeline 的功能..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={createPipeline.isPending || !name.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-none"
            >
              {createPipeline.isPending ? "创建中..." : "立即创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
