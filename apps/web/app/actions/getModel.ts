import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenAI } from "@ai-sdk/openai";

// 使用指定模型(目前写死模型)
// 非结构化输出模型
const aiClient = createOpenAICompatible({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_BASE_URL || "",
  name: process.env.AI_PROVIDER || "",
});

export const getModel = () => aiClient(process.env.AI_MODEL || "");

// 结构化输出模型
const aiClientWithStructure = createOpenAI({
  apiKey: process.env.AI_KEY_WITH_STRUCTURE,
  baseURL: process.env.AI_BASE_URL_WITH_STRUCTURE || "",
  name: process.env.AI_PROVIDER_WITH_STRUCTURE || "",
});

export const getModelWithStructure = () =>
  aiClientWithStructure(process.env.AI_MODEL_WITH_STRUCTURE || "");
