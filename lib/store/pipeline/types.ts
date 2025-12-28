/**
 * Pipeline Store Layer Types
 * 前后端共享的 Pipeline 和 Schema 类型定义
 */

// ============================================
// Pipeline 注册表 - 统一管理所有 Pipeline 的输出类型
// ============================================

/**
 * 文件名类型 - generate-code 生成的文件
 */
export type GeneratedFileName = "App.tsx" | "Component.tsx" | "styles.css" | "utils.ts";

/**
 * 单个文件的内容结构
 */
export interface GeneratedFileContent {
  content: string;
  componentName?: string;
  description: string;
}

/**
 * Pipeline 注册表接口
 * 通过 declaration merging 扩展注册新的 pipeline 类型
 */
/**
 * generate-code 输出类型 - 直接是文件 Map，无 files 包装层
 */
export type GenerateCodeOutput = Partial<Record<GeneratedFileName, GeneratedFileContent>>;

export interface PipelineRegistry {
  "business-code-generate": {
    "design-code": string; // Design Phase - 分析需求和选择组件
    "generate-code": GenerateCodeOutput; // Coding Phase - 生成代码文件
  };
}

/**
 * PipelineId 类型 - 已注册的 Pipeline ID
 */
export type PipelineId = keyof PipelineRegistry;

/**
 * 获取指定 Pipeline 下已注册的 Stage ID 类型
 */
export type StageId<P extends PipelineId> = keyof PipelineRegistry[P];

/**
 * 根据 Pipeline ID 和 Stage ID 获取对应的输出类型
 */
export type StageOutput<
  P extends PipelineId,
  S extends string
> = S extends keyof PipelineRegistry[P] ? PipelineRegistry[P][S] : unknown;

/**
 * 获取 Pipeline 的最终输出类型（最后一个 stage 的输出）
 */
export type PipelineFinalOutput<P extends PipelineId> =
  PipelineRegistry[P][keyof PipelineRegistry[P]];

// ============================================
// Pipeline 状态类型
// ============================================

export interface PipelineState<P extends PipelineId = PipelineId> {
  isRunning?: boolean;
  currentStage?: StageId<P>;
  error?: string;
  finalOutput?: PipelineFinalOutput<P>;
  previousUserInput?: string;
}

export interface StageState<P extends PipelineId = PipelineId, S extends string = string> {
  status: "idle" | "running" | "done" | "error";
  snapshot?: StageOutput<P, S>; // 流式中间态
  final?: StageOutput<P, S>; // 最终结果
  error?: string;
}

// ============================================
// SSE 事件类型定义
// ============================================

export type SSEEventType = "stageStart" | "stageDelta" | "stageFinal" | "stageError";

export interface SSEStageStartData {
  id: string;
}

export interface SSEStageDeltaData<S = unknown> {
  id: string;
  snapshot: S;
}

export interface SSEStageFinalData<F = unknown> {
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
