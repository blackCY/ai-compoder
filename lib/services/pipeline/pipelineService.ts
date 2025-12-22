/**
 * Pipeline API Service
 * 纯 API 调用层，使用 lib/request 实例
 */

import { request } from "@/lib/request";
import { PipelineStreamParams } from "./types";

/**
 * 发送 Pipeline 运行请求，返回 SSE 流 Response
 * 注意：SSE 流不设置超时
 */
export async function runPipelineStream(params: PipelineStreamParams): Promise<Response> {
  return request("/api/pipeline", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
