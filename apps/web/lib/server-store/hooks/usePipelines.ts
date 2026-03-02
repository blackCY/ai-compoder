import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPipelines, 
  getPipeline, 
  updatePipeline, 
  deletePipeline,
  createPipeline 
} from "lib/services/pipeline/pipelineService";
import { Pipeline } from "lib/services/pipeline/types";

export const usePipelines = () => {
  return useQuery<Pipeline[]>({
    queryKey: ["pipelines"],
    queryFn: getPipelines,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePipeline = (id: string) => {
  return useQuery<Pipeline>({
    queryKey: ["pipelines", id],
    queryFn: () => getPipeline(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdatePipeline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pipeline> }) => 
      updatePipeline(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", id] });
    },
  });
};

export const useDeletePipeline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePipeline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });
};

export const useCreatePipeline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => createPipeline(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });
};

