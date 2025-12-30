import { streamText, streamObject, ModelMessage } from "ai";
import { getModel, getModelWithStructure } from "../getModel";
import { jsonSchemaToZod } from "./utils/jsonSchemaToZod";
import { sendStageDelta, sendStageError, sendStageFinal, sendStageStart } from "./sse";
import { Resource, StageUsage } from "./types";
import {
  buildSystemPrompt,
  buildSingleResourcePrompt,
  buildFullResourcePrompt,
} from "./utils/resourceUtils";
import { JsonSchema } from "json-schema-to-zod";
import { isNonEmptyResources } from "./utils/isNonEmptyResources";

// ============================================
// 流处理函数选项类型
// ============================================

export interface StreamOptions {
  systemPrompt: string;
  messages: ModelMessage[];
  controller: ReadableStreamDefaultController;
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
  const { systemPrompt, messages, controller, stageId, resources } = options;

  sendStageStart(controller, stageId);

  if (isNonEmptyResources(resources)) {
    let accumulatedMarkdown = "";
    const result = await runStreamResources({
      resources,
      systemPrompt,
      messages,
      onDelta: deltaResource => {
        const markdown = buildSingleResourcePrompt(deltaResource);
        accumulatedMarkdown += markdown;
        sendStageDelta(controller, stageId, accumulatedMarkdown);
      },
      onError: error => {
        sendStageError(controller, stageId, error);
        throw error;
      },
    });

    const fullText = buildFullResourcePrompt(result.analysis, result.resources);
    
    // 构建 usage，将 runStreamResources 的 usage 作为 childrenUsages
    const usage: StageUsage = {
      ...result.usage,
      childrenUsages: [result.usage],
    };
    
    sendStageFinal(controller, stageId, fullText, { usage });

    return fullText;
  } else {
    const { fullText, usage } = await runStreamTextWithoutResource(options);
    sendStageFinal(controller, stageId, fullText, { usage });

    return fullText;
  }
}

async function runStreamTextWithoutResource(options: StreamOptions) {
  const { systemPrompt, messages, controller, stageId } = options;

  let fullText = "";

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    messages: messages,
    onError: error => {
      sendStageError(controller, stageId, error);
      throw error;
    },
  });

  // 流式输出用户可见的内容
  for await (const chunk of result.textStream) {
    fullText += chunk;
    sendStageDelta(controller, stageId, fullText);
  }

  const usage = await result.usage;

  return {
    fullText,
    usage
  };
}

/**
 * 执行 streamObject 并处理流式输出
 */
export async function runStreamObject(options: StreamObjectOptions) {
  const { systemPrompt, messages, schema, controller, stageId, resources } = options;

  const finalMessages = [...messages];
  const childrenUsages: StageUsage[] = [];

  sendStageStart(controller, stageId);

  if (isNonEmptyResources(resources)) {
    let accumulatedMarkdown = "";
    const resourceResult = await runStreamResources({
      resources,
      systemPrompt,
      messages,
      onDelta: deltaResource => {
        const markdown = buildSingleResourcePrompt(deltaResource);
        accumulatedMarkdown += markdown;
        // TODO 这里如何处理?
        // sendStageDelta(controller, stageId, accumulatedMarkdown);
      },
      onError: error => {
        sendStageError(controller, stageId, error);
        throw error;
      },
    });
    
    // 收集 runStreamResources 的 usage
    childrenUsages.push(resourceResult.usage);
    
    const resourcesMarkdown = buildFullResourcePrompt(resourceResult.analysis, resourceResult.resources);

    // 将资源选择结果作为 user message 传递给下游
    finalMessages.push({
      role: "user",
      content: `<user-requirements>\n${resourcesMarkdown}\n</user-requirements>`,
    });
  }

  const zodSchema = jsonSchemaToZod(schema);

  const result = streamObject({
    model: getModelWithStructure(),
    system: systemPrompt,
    schema: zodSchema,
    messages: finalMessages,
    onError: error => {
      sendStageError(controller, stageId, error);
      throw error;
    },
  });

  let finalObject: Record<string, unknown> = {};

  for await (const partialObject of result.partialObjectStream) {
    finalObject = partialObject as Record<string, unknown>;
    sendStageDelta(controller, stageId, finalObject);
  }

  const mainUsage = await result.usage;
  
  // 构建完整的 usage
  const usage: StageUsage = {
    ...mainUsage,
    childrenUsages: childrenUsages.length > 0 ? childrenUsages : undefined,
  };

  sendStageFinal(controller, stageId, finalObject as Record<string, unknown>, { usage });

  return finalObject as Record<string, unknown>;
}

type StreamResourcesOption = Pick<StreamOptions, "resources" | "systemPrompt" | "messages"> & {
  onError?: (error: Error | unknown) => void;
  onDelta?: (resource: { [key in 'name' | 'api' | 'description']: string}) => void;
};

/**
 * 执行资源分析并返回资源信息对象
 */
async function runStreamResources(options: StreamResourcesOption): Promise<{
  analysis: string;
  resources: Array<{ name: string; description: string; api: string }>;
  usage: StageUsage;
}> {
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
            name: {
              type: "string",
              description: "The resource key from available resources",
            },
          },
          required: ["name"],
        },
        description: "List of selected resources",
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

  let analysis = "";
  // 增量构建资源列表
  let lastProcessedCount = 0;
  const fullResources: Array<{ name: string; description: string; api: string }> = [];

  for await (const partialObject of result.partialObjectStream) {
    const { analysis: currentAnalysis, selectedResources } = partialObject as {
      analysis?: string;
      selectedResources?: Array<{ name: string }>;
    };

    // 更新 analysis
    if (currentAnalysis) {
      analysis = currentAnalysis;
    }

    const currentResources = selectedResources || [];

    // 只处理新增的、完整的资源
    for (let i = lastProcessedCount; i < currentResources.length; i++) {
      const { name } = currentResources[i];
      if (!name) continue; // 跳过不完整的资源

      const resource = resources![name];

      if (resource) {
        const fullResource = {
          name,
          description: resource.description,
          api: resource.api,
        };
        fullResources.push(fullResource);
        lastProcessedCount = i + 1;

        // 发送单个资源对象增量
        onDelta?.(fullResource);
      }
    }
  }

  const usage = await result.usage;

  // 返回完整的结构化对象
  return {
    analysis,
    resources: fullResources,
    usage,
  };
}
