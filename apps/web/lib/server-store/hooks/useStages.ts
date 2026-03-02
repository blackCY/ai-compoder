import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStages, createStage, updateStage, deleteStage } from "lib/services/pipeline/pipelineService";
import { Stage } from "lib/services/pipeline/types";

export const useStages = (pipelineId: string) => {
  return useQuery<Stage[]>({
    queryKey: ["pipelines", pipelineId, "stages"],
    queryFn: () => getStages(pipelineId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateStage = (pipelineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Stage>) => createStage(pipelineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines", pipelineId, "stages"] });
    },
  });
};

export const useUpdateStage = (pipelineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stageId, data }: { stageId: string; data: Partial<Stage> }) => 
      updateStage(pipelineId, stageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines", pipelineId, "stages"] });
    },
  });
};

export const useDeleteStage = (pipelineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stageId: string) => deleteStage(pipelineId, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines", pipelineId, "stages"] });
    },
  });
};
