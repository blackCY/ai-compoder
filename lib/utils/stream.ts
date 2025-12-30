import {
  SSECallbacks,
  SSEEventData,
  SSEDeltaData,
  SSEFinalData,
  SSEErrorData,
} from "@/lib/store/pipeline/types";

/**
 * 通用 SSE 流消费方法
 * @param request 返回 Response 的函数（可以是 fetch 或 runPipelineStream 等）
 * @param callbacks SSE 事件回调
 *
 * SSE 格式：event: xxx\ndata: xxx\n\n
 *
 * @example
 * ```typescript
 * // Pipeline 运行场景
 * await consumeSSE(() => runPipelineStream(params), callbacks);
 *
 * // 单 Stage 运行场景
 * await consumeSSE(() => fetch('/api/pipeline/stage/run', { ... }), callbacks);
 * ```
 */
export async function consumeSSE(
  request: () => Promise<Response>,
  callbacks: SSECallbacks
): Promise<void> {
  const res = await request();

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("No reader available");
  }

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

      // 处理完整的消息块（以 \n\n 分隔）
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const block of parts) {
        processSSEBlock(block, callbacks);
      }
    }

    // 处理剩余 buffer
    if (buffer.trim()) {
      processSSEBlock(buffer.trim(), callbacks);
    }
  } finally {
    reader.releaseLock();
  }
}

function processSSEBlock(block: string, callbacks: SSECallbacks) {
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
        callbacks.onDelta?.(data as SSEDeltaData);
        break;
      case "stageFinal":
        callbacks.onFinal?.(data as SSEFinalData);
        break;
      case "stageError":
        callbacks.onError?.(data as SSEErrorData);
        break;
    }
  } catch (error) {
    console.error("Failed to parse SSE data:", error, dataStr);
    const idMatch = dataStr.match(/"id"\s*:\s*"([^"]+)"/);

    callbacks.onError?.({
      id: idMatch?.[1] || "Unmatched-ID",
      error: `JSON Parse Error: ${(error as Error).message}`,
    });
  }
}
