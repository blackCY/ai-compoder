/**
 * SSE 事件发送工具函数
 * 用于向前端推送多阶段 Pipeline 的状态更新
 */

/**
 * 向流发送数据
 * - 成功：正常返回
 * - 流关闭：抛出 StreamClosedError
 */
function enqueue(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
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
  encoder: TextEncoder,
  stageId: string
) {
  enqueue(controller, encoder, `event: stageStart\ndata: ${JSON.stringify({ id: stageId })}\n\n`);
}

/**
 * 发送阶段流式数据（中间态）
 */
export function sendStageDelta(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  stageId: string,
  snapshot: string | Record<string, any>
) {
  enqueue(
    controller,
    encoder,
    `event: stageDelta\ndata: ${JSON.stringify({ id: stageId, snapshot })}\n\n`
  );
}

/**
 * 发送阶段完成事件
 */
export function sendStageFinal(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  stageId: string,
  final: string | Record<string, any>
) {
  enqueue(
    controller,
    encoder,
    `event: stageFinal\ndata: ${JSON.stringify({ id: stageId, final })}\n\n`
  );
}

/**
 * 发送阶段错误事件
 */
export function sendStageError(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  stageId: string,
  error: unknown
) {
  enqueue(
    controller,
    encoder,
    `event: stageError\ndata: ${JSON.stringify({
      id: stageId,
      error: error instanceof Error ? error.message : String(error),
    })}\n\n`
  );
}
