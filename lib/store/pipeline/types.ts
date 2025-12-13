/**
 * Pipeline Store Layer Types
 * 前后端共享的 Pipeline 和 Schema 类型定义
 */

import { ModelMessage } from "ai";

/**
 * Pipeline 注册表
 * 定义每种 Pipeline 对应的每个 Stage 的输出类型
 */
export interface PipelineRegistry {
  "business-code-generate": {
    "stage-1": {
      analysis: string;
      selectedComponents: Array<{
        name: string;
        description: string;
        api: string;
      }>;
    }; // Design Phase - 分析需求和选择组件
    "stage-2": {
      files: Array<{
        fileName: string;
        content: string;
        componentName: string;
        description: string;
      }>;
    }; // Coding Phase - 生成代码文件
  };
}

export interface StageState<S = any, F = any> {
  status: "idle" | "running" | "done" | "error";
  snapshot: S; // 流式中间态
  final: F; // 最终结果
  error?: string; // 错误信息
}

/**
 * PipelineTypeId 类型标识
 */
export type PipelineTypeId = keyof PipelineRegistry;

/**
 * 获取特定 Pipeline 的所有 Stage ID 联合类型
 */
export type SchemaStageIds<T extends PipelineTypeId> = keyof PipelineRegistry[T];

// ============================================
// Pipeline Runtime Types
// ============================================

/**
 * Pipeline 运行请求参数
 */
export interface PipelineRunParams {
  messages: ModelMessage[];
  typeId: PipelineTypeId;
}

// ============================================
// SSE 事件类型定义
// ============================================

export type SSEEventType = "stageStart" | "stageDelta" | "stageFinal" | "stageError";

export interface SSEStageStartData {
  id: string;
}

export interface SSEStageDeltaData<S = any> {
  id: string;
  snapshot: S;
}

export interface SSEStageFinalData<F = any> {
  id: string;
  final: F;
}

export interface SSEStageErrorData {
  id: string;
  error: string;
}

export type SSEEventData =
  | SSEStageStartData
  | SSEStageDeltaData
  | SSEStageFinalData
  | SSEStageErrorData;

export type SSECallbacks = {
  onStart?: (data: SSEEventData) => void;
  onDelta?: (data: SSEStageDeltaData) => void;
  onFinal?: (data: SSEStageFinalData) => void;
  onError?: (data: SSEStageErrorData) => void;
};
