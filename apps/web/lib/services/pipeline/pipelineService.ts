/**
 * Pipeline API Service
 * 纯 API 调用层，使用 lib/request 实例
 */

import { request } from "lib/request";
import { Pipeline, PipelineStreamParams } from "./types";

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

/**
 * 获取所有 Pipeline 列表
 */
export async function getPipelines(): Promise<Pipeline[]> {
  const response = await request("/api/pipelines", {
    method: "GET",
  });
  return response.json();
}

/**
 * 获取特定 Pipeline 详情
 */
export async function getPipeline(id: string): Promise<Pipeline> {
  const response = await request(`/api/pipelines/${id}`, {
    method: "GET",
  });
  return response.json();
}

/**
 * 获取特定 Pipeline 的所有阶段
 */
export async function getStages(pipelineId: string): Promise<import("./types").Stage[]> {
  const response = await request(`/api/pipelines/${pipelineId}/stages`, {
    method: "GET",
  });
  return response.json();
}

/**
 * 更新 Pipeline 详情
 */
export async function updatePipeline(id: string, data: Partial<Pipeline>): Promise<Pipeline> {
  const response = await request(`/api/pipelines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * 删除 Pipeline
 */
export async function deletePipeline(id: string): Promise<void> {
  await request(`/api/pipelines/${id}`, {
    method: "DELETE",
  });
}

/**
 * 创建阶段
 */
export async function createStage(pipelineId: string, data: Partial<import("./types").Stage>): Promise<import("./types").Stage> {
  const response = await request(`/api/pipelines/${pipelineId}/stages`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * 更新阶段
 */
export async function updateStage(pipelineId: string, stageId: string, data: Partial<import("./types").Stage>): Promise<import("./types").Stage> {
  const response = await request(`/api/pipelines/${pipelineId}/stages/${stageId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * 删除阶段
 */
export async function deleteStage(pipelineId: string, stageId: string): Promise<void> {
  await request(`/api/pipelines/${pipelineId}/stages/${stageId}`, {
    method: "DELETE",
  });
}
/**
 * 创建新 Pipeline
 */
export async function createPipeline(data: { name: string; description?: string }): Promise<Pipeline> {
  const response = await request("/api/pipelines", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}
