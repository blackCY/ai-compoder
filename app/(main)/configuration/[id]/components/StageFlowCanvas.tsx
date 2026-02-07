"use client";

import { useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Stage } from "lib/services/pipeline/types";
import { StageNode } from "./StageNode";
import { StageToolbar } from "./StageToolbar";
import { useDeleteStage } from "lib/serverStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "lib/ui/dialog";
import { Button } from "lib/ui/button";
import { Loader2 } from "lucide-react";

interface StageFlowCanvasProps {
  stages: Stage[];
  pipelineId: string;
  onStageClick: (stage: Stage) => void;
  onAddStage: () => void;
}

const nodeTypes: NodeTypes = {
  stageNode: StageNode,
};

// Calculate node position based on order_index
function calculateNodePosition(index: number, total: number) {
  const horizontalSpacing = 300;
  const verticalOffset = 100;

  return {
    x: index * horizontalSpacing,
    y: verticalOffset,
  };
}

export function StageFlowCanvas({
  stages,
  pipelineId,
  onStageClick,
  onAddStage,
}: StageFlowCanvasProps) {
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);
  const { mutateAsync: deleteStage, isPending: isDeleting } = useDeleteStage(pipelineId);

  // Store the latest onStageClick in a ref to avoid unnecessary re-renders
  const onStageClickRef = useRef(onStageClick);
  onStageClickRef.current = onStageClick;

  const handleDelete = async () => {
    if (!stageToDelete) return;
    try {
      await deleteStage(stageToDelete.id);
      toast.success("Stage deleted successfully");
      setStageToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete stage");
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Sync nodes and edges when stages change
  useEffect(() => {
    const newNodes: Node[] = stages.map((stage, index) => ({
      id: stage.id,
      type: "stageNode",
      position: calculateNodePosition(index, stages.length),
      data: {
        ...stage,
        pipelineId,
        onClick: () => onStageClickRef.current(stage),
        onDelete: (e: React.MouseEvent) => {
          e.stopPropagation();
          setStageToDelete(stage);
        },
      },
    }));

    const newEdges: Edge[] = stages.slice(0, -1).map((stage, index) => ({
      id: `e${stage.id}-${stages[index + 1].id}`,
      source: stage.id,
      target: stages[index + 1].id,
      animated: true,
      style: { stroke: "#10b981", strokeWidth: 3, opacity: 0.6 },
      type: "smoothstep",
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [stages, pipelineId, setNodes, setEdges]);

  return (
    <div className="relative h-full w-full rounded-xl border border-white/10 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      <StageToolbar onAddStage={onAddStage} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ maxZoom: 0.8, padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="bg-transparent"
        colorMode="dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#10b981"
          gap={20}
          size={0.5}
          style={{ opacity: 0.1 }}
        />
        <Controls
          className="!bg-black/60 !backdrop-blur-md !border-white/10 !rounded-xl !shadow-2xl overflow-hidden"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-black/60 !backdrop-blur-md !border-white/10 !rounded-xl !shadow-2xl overflow-hidden"
          nodeColor="#10b981"
          maskColor="rgba(0, 0, 0, 0.7)"
          style={{ height: 120, width: 180 }}
        />
      </ReactFlow>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!stageToDelete} onOpenChange={() => !isDeleting && setStageToDelete(null)}>
        <DialogContent className="bg-gray-900 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Stage</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete stage{" "}
              <span className="font-semibold text-white">{stageToDelete?.stage_id}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setStageToDelete(null)}
              disabled={isDeleting}
              className="hover:bg-white/5 text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Stage"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {stages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-2">No stages yet</p>
            <p className="text-sm text-gray-500">Click Add Stage to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
