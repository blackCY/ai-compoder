import { getStages } from "@/app/actions/pipeline/getStages";
import { runPipeline } from "@/app/actions/pipeline/runner";

export async function POST(req: Request) {
  const { messages, pipelineId } = await req.json();
  const stages = await getStages(pipelineId);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await runPipeline(
          {
            stages,
            messages,
          },
          controller
        );
      } catch (error) {
        console.error("Pipeline error:", error);
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
