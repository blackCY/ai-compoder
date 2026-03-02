import { StageUsage } from "./types";

/**
 * SSE 事件发送工具函数
 * 用于向前端推送多阶段 Pipeline 的状态更新
 */

/**
 * 向流发送数据
 * - 成功：正常返回
 * - 流关闭：抛出 StreamClosedError
 */
const encoder = new TextEncoder();

function enqueue(
  controller: ReadableStreamDefaultController,
  data: string
): void {
  try {
    controller.enqueue(encoder.encode(data));
  } catch (error) {
    throw error;
  }
}

/**
 * 发送阶段开始事件
 */
export function sendStageStart(
  controller: ReadableStreamDefaultController,
  stageId: string
) {
  enqueue(controller, `event: stageStart\ndata: ${JSON.stringify({ id: stageId })}\n\n`);
}

/**
 * 发送阶段流式数据（中间态）
 */
export function sendStageDelta(
  controller: ReadableStreamDefaultController,
  stageId: string,
  snapshot: string | Record<string, unknown>
) {
  enqueue(
    controller,
    `event: stageDelta\ndata: ${JSON.stringify({ id: stageId, snapshot })}\n\n`
  );
}

/**
 * 发送阶段完成事件
 */
export function sendStageFinal(
  controller: ReadableStreamDefaultController,
  stageId: string,
  final: string | Record<string, unknown>,
  meta?: { usage?: StageUsage }
) {
  const payload: Record<string, unknown> = { id: stageId, final };
  if (meta) {
    payload.meta = meta;
  }
  enqueue(
    controller,
    `event: stageFinal\ndata: ${JSON.stringify(payload)}\n\n`
  );
}

/**
 * 发送阶段错误事件
 */
export function sendStageError(
  controller: ReadableStreamDefaultController,
  stageId: string,
  error: unknown
) {
  enqueue(
    controller,
    `event: stageError\ndata: ${JSON.stringify({
      id: stageId,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    })}\n\n`
  );
}
