import { runStreamText, runStreamObject } from "actions/pipeline/stream";
import { getStage } from "actions/pipeline/getStages";
import { ModelMessage } from "ai";

interface RunStageRequest {
  pipelineId: string;
  stageId: string;
  input?: string;
}

export async function POST(req: Request) {
  const { pipelineId, stageId, input }: RunStageRequest = await req.json();

  // Fetch the specific stage
  const stage = await getStage(pipelineId, stageId);

  if (!stage) {
    return new Response(
      JSON.stringify({ error: `Stage "${stageId}" not found in pipeline "${pipelineId}"` }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Build messages from input if provided
  const messages: ModelMessage[] = input ? [{ role: "user", content: input }] : [];

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const options = {
          systemPrompt: stage.systemPrompt,
          messages,
          stageId: stage.stageId,
          resources: stage.resources,
          controller,
        };

        if (stage.schema) {
          // Use existing runStreamObject
          await runStreamObject({ ...options, schema: stage.schema });
        } else {
          // Use existing runStreamText
          await runStreamText(options);
        }
      } catch (error) {
        console.error("Stage run error:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
