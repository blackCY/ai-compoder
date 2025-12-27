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
 */
export async function runStreamText(options: StreamOptions): Promise<string> {
  const { systemPrompt, messages, controller, encoder, stageId, resources } = options;

  sendStageStart(controller, encoder, stageId);

  if (resources) {
    const finalResult = await runStreamResources({
      resources,
      systemPrompt,
      messages,
      onDelta: deltaObj => {
        sendStageDelta(controller, encoder, stageId, JSON.stringify(deltaObj));
      },
      onError: error => {
        sendStageError(controller, encoder, stageId, error);
        throw error;
      },
    });

    const fullText = JSON.stringify(finalResult);
    sendStageFinal(controller, encoder, stageId, fullText);

    return fullText;
  } else {
    const fullText = await runStreamTextWithoutResource(options);
    sendStageFinal(controller, encoder, stageId, fullText);

    return fullText;
  }
}

async function runStreamTextWithoutResource(options: StreamOptions) {
  const { systemPrompt, messages, controller, encoder, stageId } = options;

  let fullText = "";

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    messages: messages,
    onError: error => {
      sendStageError(controller, encoder, stageId, error);
      throw error;
    },
  });

  // 流式输出用户可见的内容
  for await (const chunk of result.textStream) {
    fullText += chunk;
    sendStageDelta(controller, encoder, stageId, fullText);
  }

  const usage = await result.usage;
  console.log(usage, "runStreamText--" + stageId);

  return fullText;
}

/**
 * 执行 streamObject 并处理流式输出
 */
export async function runStreamObject(options: StreamObjectOptions) {
  const { systemPrompt, messages, schema, controller, encoder, stageId, resources } = options;

  const finalMessages = [...messages];

  sendStageStart(controller, encoder, stageId);

  if (resources) {
    const assistantMessage = await runStreamResources({
      resources,
      systemPrompt,
      messages,
      onDelta: deltaObj => {
        sendStageDelta(controller, encoder, stageId, JSON.stringify(deltaObj));
      },
      onError: error => {
        sendStageError(controller, encoder, stageId, error);
        throw error;
      },
    });

    finalMessages.push({
      role: "assistant",
      content: JSON.stringify(assistantMessage),
    });
  }

  const zodSchema = jsonSchemaToZod(schema);

  const result = streamObject({
    model: getModelWithStructure(),
    system: systemPrompt,
    schema: zodSchema,
    messages: finalMessages,
    onError: error => {
      sendStageError(controller, encoder, stageId, error);
      throw error;
    },
  });

  let finalObject: Record<string, unknown> = {};

  for await (const partialObject of result.partialObjectStream) {
    finalObject = partialObject as Record<string, unknown>;
    sendStageDelta(controller, encoder, stageId, finalObject);
  }

  const usage = await result.usage;
  console.log(usage, "runStreamObject--" + stageId);

  sendStageFinal(controller, encoder, stageId, finalObject as Record<string, unknown>);

  console.log(finalObject, 'finalObject')

  return finalObject as Record<string, unknown>;
}

type StreamResourcesOption = Pick<StreamOptions, "resources" | "systemPrompt" | "messages"> & {
  onError?: (error: Error | unknown) => void;
  onDelta?: (delta: unknown) => void;
};

/**
 * 执行资源分析并返回完整的资源信息
 * @returns assistant message 对象，包含完整的资源信息
 */
async function runStreamResources(options: StreamResourcesOption) {
  const { systemPrompt, messages, resources, onError, onDelta } = options;

  // 构建包含资源的完整 System Prompt
  const finalSystemPrompt = buildSystemPrompt(systemPrompt, { resources });

  // 定义资源选择的 schema
  const resourceSelectionSchema: JsonSchema = {
    type: "object",
    properties: {
      analysis: {
        type: "string",
        description: "Overall analysis of which resources are needed and why",
      },
      selectedResources: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string",
              description: "The resource key from available resources",
            },
            reason: {
              type: "string",
              description: "Why this resource is needed for the current task",
            },
          },
          required: ["key", "reason"],
        },
        description: "List of selected resources with reasons",
      },
    },
    required: ["analysis", "selectedResources"],
  };

  const zodSchema = jsonSchemaToZod(resourceSelectionSchema);

  // 使用 streamObject 获取资源选择结果
  const result = streamObject({
    model: getModelWithStructure(),
    system: finalSystemPrompt,
    schema: zodSchema,
    messages,
    onError: ({ error }) => {
      onError?.(error as Error);
    },
  });

  let finalObject: {
    analysis: string;
    selectedResources: Array<{ [key in "key" | "description" | "api" | "reason"]: string }>;
  } = { analysis: "", selectedResources: [] };

  for await (const partialObject of result.partialObjectStream) {
    finalObject = partialObject as typeof finalObject;
    onDelta?.(finalObject);
  }

  const usage = await result.usage;
  console.log(usage, finalObject.selectedResources, "用到了哪些组件");

  // 根据选择的 keys 构建完整的资源对象
  const fullResources = finalObject.selectedResources.reduce((acc, { key, reason }) => {
    const resource = resources![key];
    if (!resource) {
      console.warn(`Resource key "${key}" not found in available resources`);
      return acc;
    }

    acc.push({
      key,
      description: resource.description,
      api: resource.api,
      reason,
    });
    return acc;
  }, [] as (typeof finalObject)["selectedResources"]);

  // 构建最终的结构化对象
  const finalResult = {
    analysis: finalObject.analysis,
    resources: fullResources,
  };

  return finalResult;
}
