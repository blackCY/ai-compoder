import { atom } from "jotai";
import { StageState, PipelineTypeId, PipelineRegistry } from "@/lib/store/pipeline/types";

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
 * 单个 Pipeline 的元数据状态（不包含 stages）
 */
export interface PipelineMetaState {
  isRunning: boolean;
  currentStage: string | null; // 当前正在运行的阶段
  currentStageStatus: StageState['status'] | null; // 当前阶段的状态
  error?: {
    stageId?: string;
    message: string;
  };
  finalOutput: string | null;
  previousUserInput: string | null;
}

/**
 * 单个 Pipeline 的完整状态（包含 stages，用于对外暴露）
 */
export interface SinglePipelineState<T extends PipelineTypeId = PipelineTypeId> {
  isRunning: boolean;
  currentStage: string | null; // 当前正在运行的阶段
  currentStageStatus: StageState['status'] | null; // 当前阶段的状态
  error?: {
    stageId?: string;
    message: string;
  };
  finalOutput: string | null;
  previousUserInput: string | null;
  stages: Record<string, StageState>; // 该 pipeline 的所有 stage 状态
}

/**
 * 所有 Pipeline 的元数据状态集合
 */
export type PipelinesMetaState = {
  [K in PipelineTypeId]: PipelineMetaState;
};

/**
 * 所有 Stages 的状态 Map
 * 使用 "typeId:stageId" 作为 key
 */
export type StagesState = Record<string, StageState>;

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
 * 默认 Pipeline 元数据状态
 */
export const defaultPipelineMetaState: PipelineMetaState = {
  isRunning: false,
  currentStage: null,
  currentStageStatus: null,
  finalOutput: null,
  previousUserInput: null,
};

/**
 * 创建默认的 PipelinesMetaState
 */
function createDefaultPipelinesMetaState(): PipelinesMetaState {
  const state = {} as PipelinesMetaState;
  const pipelineTypes: PipelineTypeId[] = ["business-code-generate"];
  
  pipelineTypes.forEach((typeId) => {
    state[typeId] = { ...defaultPipelineMetaState };
  });
  
  return state;
}

/**
 * 所有 Pipeline 的元数据状态 Atom（不包含 stages）
 */
export const pipelinesMetaAtom = atom<PipelinesMetaState>(createDefaultPipelinesMetaState());

/**
 * 所有 Stages 的状态 Atom
 * 使用独立的 atom 存储，key 格式为 "typeId:stageId"
 * 避免更新一个 stage 影响其他 stage 的订阅
 */
export const stagesAtom = atom<StagesState>({});

// ============================================
// Action Atoms
// ============================================

/**
 * 更新指定 Pipeline 的元数据状态
 */
export const updatePipelineAtom = atom(
  null,
  (get, set, update: { typeId: PipelineTypeId; patch: Partial<PipelineMetaState> }) => {
    const current = get(pipelinesMetaAtom);
    const pipelineState = current[update.typeId];
    set(pipelinesMetaAtom, {
      ...current,
      [update.typeId]: {
        ...pipelineState,
        ...update.patch,
      },
    });
  }
);

/**
 * 更新指定 Pipeline 的特定 Stage 状态
 * 使用独立的 key 存储，避免影响其他 stage
 */
export const updateStageAtom = atom(
  null,
  (get, set, update: { typeId: PipelineTypeId; stageId: string; patch: Partial<StageState> }) => {
    const current = get(stagesAtom);
    const stageKey = `${update.typeId}:${update.stageId}`;
    const currentStage = current[stageKey] || defaultStageState;
    
    const newStageState = {
      ...currentStage,
      ...update.patch,
    };
    
    set(stagesAtom, {
      ...current,
      [stageKey]: newStageState,
    });
  }
);

/**
 * 重置指定 Pipeline 的所有状态（包括元数据和 stages）
 */
export const resetPipelineAtom = atom(
  null,
  (get, set, typeId: PipelineTypeId) => {
    // 重置元数据
    const currentMeta = get(pipelinesMetaAtom);
    set(pipelinesMetaAtom, {
      ...currentMeta,
      [typeId]: { ...defaultPipelineMetaState },
    });
    
    // 清除该 pipeline 的所有 stages
    const currentStages = get(stagesAtom);
    const newStages: StagesState = {};
    const prefix = `${typeId}:`;
    Object.entries(currentStages).forEach(([key, value]) => {
      if (!key.startsWith(prefix)) {
        newStages[key] = value;
      }
    });
    set(stagesAtom, newStages);
  }
);
