import { Pipeline } from "lib/services/pipeline/types";
import { PipelineCard } from "./PipelineCard";
import { PipelineGridClient } from "./PipelineGridClient";

interface PipelineGridProps {
  initialPipelines: Pipeline[];
}

/**
 * PipelineGrid Server Component
 * Renders initial data server-side for Full Route Cache
 */
export function PipelineGrid({ initialPipelines }: PipelineGridProps) {
  return (
    <PipelineGridClient initialPipelines={initialPipelines} />
  );
}
