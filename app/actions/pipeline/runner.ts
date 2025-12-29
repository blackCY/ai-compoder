import { ModelMessage } from "ai";
import { runStreamText, runStreamObject } from "./stream";
import { PipelineRunParams } from "./types";
import type { StreamOptions, StreamObjectOptions } from "./stream";
import { objectToMarkdown } from "./utils/objectToMarkdown";

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
    const stageId = stage.stageId;

    // 准备消息上下文
    // 第一阶段：只使用用户消息
    // 后续阶段：使用用户消息 + 前一个阶段的输出
    const stageMessages: ModelMessage[] = previousStageOutput
      ? [...messages, previousStageOutput]
      : [...messages];

    // console.log(stageMessages, "stageMessages", stageId);

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
        // 将 object 转为 markdown 格式
        assistantMessage = objectToMarkdown(result);
      } else {
        // 无 schema：使用 streamText
        assistantMessage = await runStreamText(streamOptions);
      }

      // 保存当前阶段的输出，供下一个阶段使用
      // 使用 user 角色 + XML 包裹，使下游阶段清楚这是任务要求
      previousStageOutput = {
        role: "user",
        content: `<user-requirements>\n${assistantMessage}\n</user-requirements>`,
      };
    } catch (error) {
      throw error; // 终止 Pipeline
    }
  }

  // 返回最后阶段的结果
  return assistantMessage;
}
