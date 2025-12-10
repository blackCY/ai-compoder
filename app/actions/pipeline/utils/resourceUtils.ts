import { Resource } from "../types";

/**
 * System Prompt 构建参数
 * 后续可以在此扩展更多上下文类型
 */
export interface SystemPromptParams {
  resources?: Resource;
}

/**
 * 构建带有资源信息的系统提示词
 * @param basePrompt 基础系统提示词
 * @param params 构建参数
 */
export function buildSystemPrompt(basePrompt: string, params: SystemPromptParams = {}): string {
  let finalPrompt = basePrompt;

  finalPrompt += buildResourcePrompt(params.resources);

  return finalPrompt;
}

function buildResourcePrompt(resources?: Resource): string {
  if (!resources || Object.keys(resources).length === 0) return "";

  const resourceText = Object.entries(resources)
    .map(([name, config]) => {
      return `## Component: ${name}\nDescription: ${config.description}\nAPI:\n${config.api}`;
    })
    .join("\n\n");

  return `\n\n# Available Private Components Library\n${resourceText}`;
}
