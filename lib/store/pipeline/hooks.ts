"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { useMemo } from "react";
import {
  pipelineAtom,
  stagesAtom,
  defaultStageState,
  updatePipelineAtom,
  updateStageAtom,
  resetAllAtom,
  PipelineState,
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
 * usePipelineState - 获取 Pipeline 全局状态
 * 包含 isRunning 和 error 信息
 */
export function usePipelineState(): PipelineState {
  return useAtomValue(pipelineAtom);
}

/**
 * usePipeline - 管理 Pipeline 运行
 * 每次 run() 调用都是一个全新的任务
 * 支持类型安全的 pipeline 类型推断
 */
export function usePipeline() {
  const pipelineState = usePipelineState();
  const updatePipeline = useSetAtom(updatePipelineAtom);
  const updateStage = useSetAtom(updateStageAtom);
  const resetAll = useSetAtom(resetAllAtom);

  const run = async (input: string, typeId: PipelineTypeId) => {
    if (pipelineState.isRunning) return;

    // 1. 构建消息上下文
    const messages: ModelMessage[] = [];
    const { previousUserInput, finalOutput } = pipelineState;

    // 如果有上一轮对话上下文，插入历史记录
    if (previousUserInput && finalOutput) {
      messages.push({ role: "user", content: previousUserInput });
      const content = typeof finalOutput === 'string' ? finalOutput : JSON.stringify(finalOutput);
      messages.push({ role: "assistant", content });
    }

    // 始终添加当前用户输入
    messages.push({ role: "user", content: input });

    // 2. 重置并更新状态
    resetAll();
    updatePipeline({
      isRunning: true,
      finalOutput: null,
      previousUserInput: input, // 保存当前输入作为下一次的"上一轮输入"
    });

    try {
      await consumeSSE(
        { messages, typeId },
        update => {
          updateStage(update);

          // 如果是错误事件，同步到 pipelineAtom
          if (update.patch.status === "error" && update.patch.error) {
            updatePipeline({
              error: {
                stageId: update.id,
                message: update.patch.error,
              },
            });
          }
        },
        finalOutput => {
          // 运行结束后保存最终输出，供下一次对话使用
          updatePipeline({ finalOutput });
        }
      );
    } finally {
      updatePipeline({ isRunning: false });
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
 * useStage - 获取指定阶段的状态
 * 使用 selectAtom 优化：只在对应 stageId 的状态变化时才重渲染
 * 支持通过泛型进行类型安全的 schema 推断
 */
export function useStage<
  T extends PipelineTypeId,
  S extends keyof PipelineRegistry[T]
>(
  // TODO 这里优化一下，这个 typeId 目前没有用到，说明全部 pipeline 都合到一起了，得区分开
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
    () => selectAtom(stagesAtom, stages => stages[stageId as string] ?? defaultStageState, shallowEqual),
    [stageId]
  );

  const stageState = useAtomValue(stageAtom);

  return {
    stageId,
    ...stageState,
  } as any;
}
