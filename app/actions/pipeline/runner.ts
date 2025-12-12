"use server";

import { ModelMessage } from "ai";
import { runStreamText, runStreamObject } from "./stream";
import { PipelineRunParams } from "./types";
import type { StreamOptions, StreamObjectOptions } from "./stream";

/**
 * 运行多阶段 Pipeline
 * @param params Pipeline 运行参数
 * @param controller SSE 流控制器
 */
export async function runPipeline(
  params: PipelineRunParams,
  controller: ReadableStreamDefaultController
) {
  const { messages, stages } = params;
  const encoder = new TextEncoder();

  let assistantMessage = "";
  let previousStageOutput: ModelMessage | null = null;

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    // TODO 如何优化设计?
    const stageId = `stage-${i + 1}`;

    // 准备消息上下文
    // 第一阶段：只使用用户消息
    // 后续阶段：使用用户消息 + 前一个阶段的输出
    const stageMessages: ModelMessage[] = previousStageOutput
      ? [...messages, previousStageOutput]
      : [...messages];

    const streamOptions: StreamOptions = {
      ...stage,
      messages: stageMessages,
      controller,
      encoder,
      stageId,
    };

    try {
      // 根据是否有 schema 选择处理方式
      if (stage.schema) {
        // 有 schema：使用 streamObject
        const result = await runStreamObject(streamOptions as StreamObjectOptions);
        assistantMessage = JSON.stringify(result);
      } else {
        // 无 schema：使用 streamText
        assistantMessage = await runStreamText(streamOptions);
      }

      // 保存当前阶段的输出，供下一个阶段使用
      previousStageOutput = { role: "assistant", content: assistantMessage };
    } catch (error) {
      throw error; // 终止 Pipeline
    }
  }

  // 返回最后的结果
  return assistantMessage;
}
