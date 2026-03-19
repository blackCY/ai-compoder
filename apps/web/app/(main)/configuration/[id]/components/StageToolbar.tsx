"use client";

import { Plus, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { Button } from "lib/ui/button";

interface StageToolbarProps {
  onAddStage: () => void;
}

export function StageToolbar({ onAddStage }: StageToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleAddStage = () => {
    onAddStage();
  };

  return (
    <div className="absolute top-6 left-6 z-10 flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-2xl">
      <Button
        onClick={handleAddStage}
        size="sm"
        className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
      >
        <Plus className="mr-2 h-4 w-4" />
        添加节点
      </Button>

      <div className="w-px h-5 bg-white/10 mx-1" />

      <div className="flex gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoomIn()}
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoomOut()}
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fitView()}
          className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          title="Fit View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
