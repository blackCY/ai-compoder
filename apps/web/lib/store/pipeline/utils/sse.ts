import { runPipelineStream } from "lib/services";
import { PipelineStreamParams } from "lib/services/pipeline/types";
import { SSECallbacks } from "../types";
import { consumeSSE as consumeSSEStream } from "lib/utils/stream";

/**
 * 消费 SSE 流
 * @param params Pipeline 运行参数
 * @param callbacks 各个阶段的回调函数
 */
export async function consumeSSE(
  params: PipelineStreamParams,
  callbacks: SSECallbacks
) {
  await consumeSSEStream(() => runPipelineStream(params), callbacks);
}
