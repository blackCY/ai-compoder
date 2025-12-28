import { ModelMessage } from "ai";
import { GenerateCodeOutput, PipelineId, PipelineFinalOutput } from "../types";

/**
 * BusinessCodeGenerate Pipeline 的消息上下文构建逻辑
 */
function buildBusinessCodeGenerateMessageContext(
  previousUserInput: string | undefined,
  finalOutput: GenerateCodeOutput
): ModelMessage[] {
  if (!previousUserInput || !finalOutput) return [];

  const messages: ModelMessage[] = [{ role: "user", content: previousUserInput }];

  const lines: string[] = ["# 上一轮生成结果", ""];

  for (const [fileName, fileContent] of Object.entries(finalOutput)) {
    if (!fileContent) continue;

    // 文件名作为二级标题
    lines.push(`## ${fileName}`);
    lines.push("");

    // 描述信息
    if (fileContent.description) {
      lines.push(fileContent.description);
      lines.push("");
    }

    // 代码内容作为三级标题下的代码块
    lines.push("### 代码内容");
    lines.push("");

    // 根据文件扩展名确定代码语言
    const ext = fileName.split(".").pop() || "";
    const langMap: Record<string, string> = {
      tsx: "tsx",
      ts: "typescript",
      css: "css",
      js: "javascript",
      jsx: "jsx",
    };
    const lang = langMap[ext] || ext;

    lines.push(`\`\`\`${lang}`);
    lines.push(fileContent.content);
    lines.push("```");
    lines.push("");
  }
  
  // 使用 user 角色
  // 将 GenerateCodeOutput 转换为 Markdown 格式
  messages.push({ role: "user", content: lines.join("\n") });

  return messages;
}

/**
 * 构建指定 Pipeline 的消息上下文
 */
export function buildMessageContext<P extends PipelineId>(
  pipelineId: P,
  previousUserInput: string | undefined,
  finalOutput: PipelineFinalOutput<P> | undefined
): ModelMessage[] {
  switch (pipelineId) {
    case "business-code-generate":
      return buildBusinessCodeGenerateMessageContext(
        previousUserInput,
        finalOutput as GenerateCodeOutput
      );
    default:
      return [];
  }
}
