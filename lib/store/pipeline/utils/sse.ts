import { runPipelineStream } from "@/lib/services";
import { PipelineStreamParams } from "@/lib/services/pipeline/types";
import {
  SSEEventData,
  SSEStageDeltaData,
  SSEStageFinalData,
  SSEStageErrorData,
  SSECallbacks,
} from "../types";

/**
 * 消费 SSE 流
 * @param params Pipeline 运行参数
 * @param callbacks 各个阶段的回调函数
 */
export async function consumeSSE(
  params: PipelineStreamParams,
  callbacks: SSECallbacks
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
        processSSEBlock(block, callbacks);
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Flush remaining buffer
  // This is normal if the stream didn't end with \n\n or if there was a final incomplete chunk
  if (buffer.trim()) {
    processSSEBlock(buffer.trim(), callbacks);
  }
}

function processSSEBlock(
  block: string,
  callbacks: SSECallbacks
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
        callbacks.onStart?.(data);
        break;
      case "stageDelta":
        callbacks.onDelta?.(data as SSEStageDeltaData);
        break;
      case "stageFinal":
        callbacks.onFinal?.(data as SSEStageFinalData);
        break;
      case "stageError":
        callbacks.onError?.(data as SSEStageErrorData);
        break;
    }
  } catch (error) {
    console.error("Failed to parse SSE data:", error, dataStr);
    const idMatch = dataStr.match(/"id"\s*:\s*"([^"]+)"/);
    
    callbacks.onError?.({
      id: idMatch?.[1] || "Unmatched-Stage",
      error: `JSON Parse Error: ${(error as Error).message}`,
    });
  }
}
