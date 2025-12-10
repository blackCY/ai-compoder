import { ModelMessage } from "ai";
import { JsonSchema } from "json-schema-to-zod";

// ============================================
// Multi-Stage AI Pipeline - Core Types
// ============================================

export type Resource = Record<
  string,
  {
    description: string;
    api: string;
  }
>;

/**
 * 用户配置的阶段定义（纯数据）
 */
export interface StageConfig {
  systemPrompt: string; // 系统提示词
  schema?: JsonSchema; // 可选，JSON Schema 对象
  resources?: Resource; // 可选，私有资源
}

/**
 * Pipeline 运行参数
 */
export interface PipelineRunParams {
  messages: ModelMessage[];
  stages: StageConfig[];
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * 验证器类型
 */
export type Validator<T> = (output: T) => ValidationResult;