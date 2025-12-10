import { runPipelineStream } from "@/lib/services";
import {
  PipelineRunParams,
  StageState,
  SSEEventData,
  SSEStageDeltaData,
  SSEStageFinalData,
  SSEStageErrorData,
} from "./types";

type UpdateCallback = (update: { id: string; patch: Partial<StageState> }) => void;

/**
 * 消费 SSE 流
 * @param params Pipeline 运行参数
 * @param updateStage 状态更新回调
 */
export async function consumeSSE(
  params: PipelineRunParams,
  updateStage: UpdateCallback,
  onFinalOutput?: (output: string) => void
) {
  const res = await runPipelineStream(params);

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        buffer += decoder.decode(); // Flush any remaining characters
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process complete events separated by \n\n
      const parts = buffer.split("\n\n");
      // The last part might be incomplete, so keep it in the buffer
      buffer = parts.pop() || "";

      for (const block of parts) {
        processSSEBlock(block, updateStage, onFinalOutput);
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Flush remaining buffer
  // This is normal if the stream didn't end with \n\n or if there was a final incomplete chunk
  if (buffer.trim()) {
    processSSEBlock(buffer, updateStage, onFinalOutput);
  }
}

function processSSEBlock(
  block: string,
  updateStage: UpdateCallback,
  onFinalOutput?: (output: string) => void
) {
  if (!block.trim()) return;

  const lines = block.split("\n");
  const eventLine = lines.find(line => line.startsWith("event: "));
  const dataLine = lines.find(line => line.startsWith("data: "));

  if (!eventLine || !dataLine) return;

  const event = eventLine.replace("event: ", "").trim();
  const dataStr = dataLine.replace("data: ", "").trim();

  try {
    const data = JSON.parse(dataStr) as SSEEventData;

    switch (event) {
      case "stageStart":
        updateStage({ id: data.id, patch: { status: "running", snapshot: "", final: "" } });
        break;
      case "stageDelta": {
        const delta = data as SSEStageDeltaData;
        updateStage({ id: delta.id, patch: { snapshot: delta.snapshot } });
        break;
      }
      case "stageFinal": {
        const finalData = data as SSEStageFinalData;
        updateStage({ id: finalData.id, patch: { status: "done", final: finalData.final } });
        onFinalOutput?.(finalData.final);
        break;
      }
      case "stageError": {
        const errorData = data as SSEStageErrorData;
        updateStage({ id: errorData.id, patch: { status: "error", error: errorData.error } });
        break;
      }
    }
  } catch (error) {
    console.error("Failed to parse SSE data:", error, dataStr);
    const idMatch = dataStr.match(/"id"\s*:\s*"([^"]+)"/);

    updateStage({
      id: idMatch?.[1] || "Unmatched-Stage",
      patch: { status: "error", error: `JSON Parse Error: ${(error as Error).message}` },
    });
  }
}
