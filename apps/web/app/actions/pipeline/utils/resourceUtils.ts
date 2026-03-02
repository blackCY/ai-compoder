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

You have access to the following resources.

${resourceDescriptions}

Important: Only request resources that are necessary for the current task to minimize token usage.`;
}

/**
 * 将单个资源格式化为 Markdown
 */
export function buildSingleResourcePrompt(resource: {
  name: string;
  description: string;
  api: string;
}): string {
  return `### ${resource.name}
**Description:** ${resource.description}
**API:**
${resource.api}

`;
}

/**
 * 构建完整的资源分析结果 Markdown
 */
export function buildFullResourcePrompt(
  analysis: string,
  resources: Array<{ name: string; description: string; api: string }>
): string {
  let markdown = `## Selected Resources\n\n`;
  markdown += `### Analysis\n${analysis}\n\n`;

  for (const resource of resources) {
    markdown += buildSingleResourcePrompt(resource);
  }

  return markdown;
}