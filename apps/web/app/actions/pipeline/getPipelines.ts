"use server";

import { Pipeline } from "lib/services/pipeline/types";
import { revalidatePath } from "next/cache";

/**
 * Fetch all pipelines from database
 * Server Action for use in Server Components
 */
export async function getPipelines(): Promise<Pipeline[]> {
  try {
    const { fetchPipelines } = await import("db/queries");
    const dbPipelines = await fetchPipelines();

    // Transform DbPipeline to Pipeline format
    return dbPipelines.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      created_at: p.created_at,
    }));
  } catch (error) {
    console.error("Failed to fetch pipelines:", error);
    return [];
  }
}

/**
 * Create a new pipeline
 * Server Action for mutations
 */
export async function createPipelineAction(data: {
  name: string;
  description?: string;
}): Promise<Pipeline | null> {
  try {
    const { createPipeline } = await import("db/queries");
    const newPipeline = await createPipeline(data);

    // Revalidate home page to refresh Full Route Cache
    revalidatePath("/");

    return {
      id: newPipeline.id,
      name: newPipeline.name,
      description: newPipeline.description,
      created_at: newPipeline.created_at,
    };
  } catch (error) {
    console.error("Failed to create pipeline:", error);
    return null;
  }
}
