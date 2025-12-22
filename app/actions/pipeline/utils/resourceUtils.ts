import { Resource } from "../types";

/**
 * System Prompt 构建参数
 */
export interface SystemPromptParams {
  resources?: Resource;
}

/**
 * 构建轻量级系统提示词（只包含资源描述）
 * @param basePrompt 基础系统提示词
 * @param params 构建参数
 */
export function buildSystemPrompt(basePrompt: string, params: SystemPromptParams = {}): string {
  let finalPrompt = basePrompt;

  if (params.resources && Object.keys(params.resources).length > 0) {
    finalPrompt += buildResourcePrompt(params.resources);
  }

  return finalPrompt;
}

function buildResourcePrompt(resources: Resource): string {
  const resourceDescriptions = Object.entries(resources)
    .map(([key, { description }]) => `- ${key}: ${description}`)
    .join("\n");

  return `\n\n## Available Resources

You have access to the following resources. Use the readResource tool when you need full details:

${resourceDescriptions}

Important: Only request resources that are necessary for the current task to minimize token usage.`;
}