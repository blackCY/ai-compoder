import { streamText, streamObject, ModelMessage } from "ai";
import { getModel, getModelWithStructure } from "../getModel";
import { jsonSchemaToZod } from "./utils/jsonSchemaToZod";
import { sendStageDelta, sendStageError, sendStageFinal, sendStageStart } from "./sse";
import { Resource } from "./types";
import { buildSystemPrompt } from "./utils/resourceUtils";
import { JsonSchema } from "json-schema-to-zod";

// ============================================
// 流处理函数选项类型
// ============================================

export interface StreamOptions {
  systemPrompt: string;
  messages: ModelMessage[];
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
  stageId: string;
  resources?: Resource;
}

export interface StreamObjectOptions extends StreamOptions {
  schema: JsonSchema;
}

// ============================================
// 流处理函数
// ============================================

/**
 * 执行 streamText 并处理流式输出
 * @returns 完整的文本输出
 */
export async function runStreamText(options: StreamOptions): Promise<string> {
  const { systemPrompt, messages, controller, encoder, stageId, resources } = options;

  sendStageStart(controller, encoder, stageId);

  // 构建包含资源的完整 System Prompt
  const finalSystemPrompt = buildSystemPrompt(systemPrompt, { resources });

  const result = streamText({
    model: getModel(),
    system: finalSystemPrompt,
    messages,
    onError: error => {
      sendStageError(controller, encoder, stageId, error);
      throw error;
    },
  });

  let fullText = "";
  for await (const chunk of result.textStream) {
    fullText += chunk;
    sendStageDelta(controller, encoder, stageId, fullText);
  }

  sendStageFinal(controller, encoder, stageId, fullText);

  return fullText;
}

/**
 * 执行 streamObject 并处理流式输出
 * @returns 完整的对象输出
 */
export async function runStreamObject(options: StreamObjectOptions) {
  const { systemPrompt, messages, schema, controller, encoder, stageId, resources } = options;

  sendStageStart(controller, encoder, stageId);

  // 构建包含资源的完整 System Prompt
  const finalSystemPrompt = buildSystemPrompt(systemPrompt, { resources });
  const zodSchema = jsonSchemaToZod(schema);

  const result = streamObject({
    model: getModelWithStructure(),
    system: finalSystemPrompt,
    schema: zodSchema,
    messages,
    onError: error => {
      sendStageError(controller, encoder, stageId, error);
      throw error;
    },
  });

  let finalObject: Record<string, any> = {};

  for await (const partialObject of result.partialObjectStream) {
    finalObject = partialObject as Record<string, any>;
    sendStageDelta(controller, encoder, stageId, finalObject);
  }

  sendStageFinal(controller, encoder, stageId, finalObject);

  return finalObject;
}
