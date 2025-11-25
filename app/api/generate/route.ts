import { streamText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// 创建第三方 OpenAI compatible 客户端
const aiClient = createOpenAICompatible({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "",
  name: process.env.AI_PROVIDER || "",
});

// 使用指定模型
const model = aiClient(process.env.AI_MODEL || "gpt-4");

// POST /api/generate
export async function POST(request: Request) {
  const { prompt, user }: { prompt: string; user: any } = await request.json();

  console.log(user, "user");

  const result = streamText({
    model,
    // messages: convertToModelMessages(message),
    prompt,
    // TODO
    // temperature: 0.7
    // messages: [{
    //   role: 'tool',
    // }],
  });

  return result.toUIMessageStreamResponse();
}
