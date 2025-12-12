"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { useMemo } from "react";
import {
  pipelinesMetaAtom,
  stagesAtom,
  defaultStageState,
  updatePipelineAtom,
  updateStageAtom,
  resetPipelineAtom,
  SinglePipelineState,
} from "./atoms";
import { consumeSSE } from "./sse";
import { StageState } from "./types";
import { ModelMessage } from "ai";
import {
  PipelineTypeId,
  PipelineRegistry
} from "./types";

// ============================================
// Hooks
// ============================================

/**
 * usePipelineState - 获取指定 Pipeline 的完整状态
 * 包含 isRunning、error、stages 等信息
 * 注意：stages 是动态组合的，如果只需要元数据，考虑使用 usePipelineMeta
 * 
 * @param typeId - Pipeline 类型 ID
 */
export function usePipelineState<T extends PipelineTypeId>(
  typeId: T
): SinglePipelineState<T> {
  const metaAtom = useMemo(
    () => selectAtom(pipelinesMetaAtom, (pipelines) => pipelines[typeId]),
    [typeId]
  );
  const meta = useAtomValue(metaAtom);
  
  // 获取该 pipeline 的所有 stages
  const stagesMapAtom = useMemo(
    () => selectAtom(stagesAtom, (allStages) => {
      const prefix = `${typeId}:`;
      const pipelineStages: Record<string, StageState> = {};
      Object.entries(allStages).forEach(([key, value]) => {
        if (key.startsWith(prefix)) {
          const stageId = key.slice(prefix.length);
          pipelineStages[stageId] = value;
        }
      });
      return pipelineStages;
    }),
    [typeId]
  );
  const stages = useAtomValue(stagesMapAtom);
  
  return {
    ...meta,
    stages,
  } as SinglePipelineState<T>;
}

/**
 * usePipelineMeta - 仅获取 Pipeline 的元数据（不包含 stages）
 * 性能更好，适合只需要 isRunning、error 等信息的场景
 * 
 * @param typeId - Pipeline 类型 ID
 */
export function usePipelineMeta<T extends PipelineTypeId>(typeId: T) {
  const metaAtom = useMemo(
    () => selectAtom(pipelinesMetaAtom, (pipelines) => pipelines[typeId]),
    [typeId]
  );
  return useAtomValue(metaAtom);
}

/**
 * usePipeline - 管理指定类型 Pipeline 的运行
 * 每次 run() 调用都是一个全新的任务
 * 支持类型安全的 pipeline 类型推断
 * 
 * @param typeId - Pipeline 类型 ID
 */
export function usePipeline<T extends PipelineTypeId>(typeId: T) {
  const pipelineMeta = usePipelineMeta(typeId);
  const updatePipeline = useSetAtom(updatePipelineAtom);
  const updateStage = useSetAtom(updateStageAtom);
  const resetPipeline = useSetAtom(resetPipelineAtom);

  const run = async (input: string) => {
    if (pipelineMeta.isRunning) return;

    // 1. 构建消息上下文
    const messages: ModelMessage[] = [];
    const { previousUserInput, finalOutput } = pipelineMeta;

    // 如果有上一轮对话上下文，插入历史记录
    if (previousUserInput && finalOutput) {
      messages.push({ role: "user", content: previousUserInput });
      const content = typeof finalOutput === 'string' ? finalOutput : JSON.stringify(finalOutput);
      messages.push({ role: "assistant", content });
    }

    // 始终添加当前用户输入
    messages.push({ role: "user", content: input });

    // 2. 重置并更新状态
    resetPipeline(typeId);
    updatePipeline({
      typeId,
      patch: {
        isRunning: true,
        finalOutput: null,
        previousUserInput: input, // 保存当前输入作为下一次的"上一轮输入"
      },
    });

    try {
      await consumeSSE(
        { messages, typeId },
        update => {
          updateStage({
            typeId,
            stageId: update.id,
            patch: update.patch,
          });

          // 如果是错误事件，同步到 pipeline 状态
          if (update.patch.status === "error" && update.patch.error) {
            updatePipeline({
              typeId,
              patch: {
                error: {
                  stageId: update.id,
                  message: update.patch.error,
                },
              },
            });
          }
        },
        finalOutput => {
          // 运行结束后保存最终输出，供下一次对话使用
          updatePipeline({
            typeId,
            patch: { finalOutput },
          });
        }
      );
    } finally {
      updatePipeline({
        typeId,
        patch: { isRunning: false },
      });
    }
  };

  return {
    run,
  };
}

/**
 * 浅比较函数，用于 selectAtom
 */
function shallowEqual(a: StageState, b: StageState): boolean {
  return (
    a.status === b.status && a.snapshot === b.snapshot && a.final === b.final && a.error === b.error
  );
}

/**
 * useStage - 获取指定 Pipeline 的指定 Stage 状态
 * 使用独立的 stage key 存储，完全隔离不同 stage 的更新
 * 支持通过泛型进行类型安全的 schema 推断
 * 
 * @param typeId - Pipeline 类型 ID，用于定位具体的 pipeline
 * @param stageId - Stage ID，必须是该 Pipeline 类型的有效 stage
 */
export function useStage<
  T extends PipelineTypeId,
  S extends keyof PipelineRegistry[T]
>(
  typeId: T,
  stageId: S
): {
  stageId: S;
  status: StageState["status"];
  snapshot: PipelineRegistry[T][S];
  final: PipelineRegistry[T][S];
  error?: string;
} {
  const stageAtom = useMemo(
    () =>
      selectAtom(
        stagesAtom,
        (stages) => {
          const key = `${typeId}:${stageId as string}` as keyof typeof stages;
          return stages[key] ?? defaultStageState;
        },
        shallowEqual
      ),
    [typeId, stageId]
  );

  const stageState = useAtomValue(stageAtom);

  return {
    stageId,
    ...stageState,
  } as any;
}
