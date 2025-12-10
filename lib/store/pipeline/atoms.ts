import { atom } from "jotai";
import { StageState } from "@/lib/store/pipeline/types";

// ============================================
// 类型定义
// ============================================

/**
 * Pipeline 错误信息
 */
export interface PipelineError {
  stageId: string;
  message: string;
  stageState?: StageState;
}

/**
 * Pipeline 全局状态
 */
export interface PipelineState {
  isRunning: boolean;
  error?: {
    stageId?: string;
    message: string;
  };
  finalOutput: any | null;
  previousUserInput: string | null;
}

// ============================================
// Atoms
// ============================================

/**
 * 默认阶段状态
 */
export const defaultStageState: StageState = {
  status: "idle",
  snapshot: "",
  final: "",
};

/**
 * 默认 Pipeline 状态
 */
export const defaultPipelineState: PipelineState = {
  isRunning: false,
  finalOutput: null,
  previousUserInput: null,
};

/**
 * Pipeline 全局状态 Atom
 * 包含运行状态和错误信息
 */
export const pipelineAtom = atom<PipelineState>(defaultPipelineState);

/**
 * 所有阶段的状态 Map
 */
export const stagesAtom = atom<Record<string, StageState>>({});

// ============================================
// Action Atoms
// ============================================

/**
 * 更新 Pipeline 状态
 */
export const updatePipelineAtom = atom(null, (get, set, update: Partial<PipelineState>) => {
  const current = get(pipelineAtom);
  set(pipelineAtom, { ...current, ...update });
});

/**
 * 更新特定阶段状态
 */
export const updateStageAtom = atom(
  null,
  (get, set, update: { id: string; patch: Partial<StageState> }) => {
    const current = get(stagesAtom);
    set(stagesAtom, {
      ...current,
      [update.id]: { ...current[update.id], ...update.patch },
    });
  }
);

/**
 * 重置所有状态（Pipeline + Stages）
 */
export const resetAllAtom = atom(null, (_get, set) => {
  set(pipelineAtom, defaultPipelineState);
  set(stagesAtom, {});
});
