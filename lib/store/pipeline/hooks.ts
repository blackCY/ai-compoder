"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { pipelineStateAtomFamily, pipelineStagesAtomFamily } from "./atoms";
import { consumeSSE } from "./utils/sse";
import { StageState, PipelineState, SSECallbacks, PipelineId, StageOutput } from "./types";
import { ModelMessage } from "ai";
import { mergeData } from "./utils/mergeData";

export function usePipelineState<P extends PipelineId>(pipelineId: P): PipelineState<P> {
  return useAtomValue(pipelineStateAtomFamily(pipelineId)) as unknown as PipelineState<P>;
}

export function usePipelineStateAction<P extends PipelineId>(pipelineId: P) {
  const setPipelineState = useSetAtom(pipelineStateAtomFamily(pipelineId));

  return {
    /** pipeline 开始执行 */
    start(userInput: PipelineState["previousUserInput"]) {
      setPipelineState(prev => ({
        ...prev,
        isRunning: true,
        error: undefined,
        previousUserInput: userInput,
      }));
    },
    /** pipeline 正常结束 */
    finish(finalOutput: PipelineState["finalOutput"]) {
      setPipelineState(prev => ({
        ...prev,
        isRunning: false,
        finalOutput,
      }));
    },
    /** pipeline 出错 */
    fail(error: PipelineState["error"]) {
      setPipelineState(prev => ({
        ...prev,
        isRunning: false,
        error,
      }));
    },
    /** 重置 pipeline 状态 */
    reset() {
      setPipelineState({
        isRunning: false,
        error: undefined,
        currentStage: undefined,
      });
    },
    /** 更新 currentStage */
    setCurrentStage(stageId: string) {
      setPipelineState(
        prev =>
          ({
            ...prev,
            currentStage: stageId,
          } as PipelineState)
      );
    },
  };
}

export function usePipelineStage<P extends PipelineId, S extends string>(
  pipelineId: P,
  stageId: S
): StageState<P, S> {
  return useAtomValue(
    pipelineStagesAtomFamily(`${pipelineId}_${stageId}`)
  ) as unknown as StageState<P, S>;
}

type ReduceStageEvent = Partial<StageState> & { type: "start" | "append" | "finish" | "error" };

function reduceStage(prev: StageState, event: ReduceStageEvent): StageState {
  switch (event.type) {
    case "start":
      return {
        ...prev,
        error: event.error,
        status: event.status!,
        snapshot: undefined,
      };
    case "append":
      return {
        ...prev,
        snapshot: event.snapshot,
      };
    case "finish":
      return {
        ...prev,
        status: event.status!,
        final: event.final,
        snapshot: event.final,
      };
    case "error":
      return {
        ...prev,
        status: event.status!,
        error: event.error,
      };
    default:
      return prev;
  }
}

/**
 * 返回可以直接在异步函数/回调中使用的 stage action 函数
 * 支持读取当前 stage 状态用于合并
 */
function usePipelineStageActions<P extends PipelineId>(pipelineId: P) {
  const dispatchStage = useAtomCallback(
    (get, set, { stageId, event }: { stageId: string; event: ReduceStageEvent }) => {
      const atom = pipelineStagesAtomFamily(`${pipelineId}_${stageId}`);
      set(atom, prev => reduceStage(prev, event));
    }
  );

  const getStageState = useAtomCallback((get, _set, stageId: string) => {
    const atom = pipelineStagesAtomFamily(`${pipelineId}_${stageId}`);
    return get(atom);
  });

  return { dispatch: dispatchStage, getStageState };
}

/**
 * useStageUpdate - 用于手动更新 stage 数据
 *
 * @param pipelineId - Pipeline ID
 * @param stageId - Stage ID
 * @param isFinal - 是否是最后一个阶段，最后阶段会同步到 pipelineState.finalOutput
 */
export function useStageUpdate<P extends PipelineId, S extends string>(
  pipelineId: P,
  stageId: S,
  isFinal: boolean = false
) {
  const { finish } = usePipelineStateAction(pipelineId);
  const { dispatch } = usePipelineStageActions(pipelineId);

  const updateStage = (newData: StageOutput<P, S>) => {
    // 更新 stage 的 final 和 snapshot
    dispatch({
      stageId,
      event: {
        type: "finish",
        status: "done",
        final: newData,
        snapshot: newData,
      },
    });

    // 如果是最后一个阶段，同步到 pipelineState.finalOutput
    if (isFinal) {
      finish(newData as PipelineState["finalOutput"]);
    }
  };

  return { updateStage };
}

/**
 * usePipeline - 管理指定 Pipeline 的运行
 * 每次 run() 调用都是一个全新的任务
 * 支持类型安全的 pipeline 类型推断
 *
 * @param pipelineId - Pipeline ID
 */
export function usePipeline<T extends PipelineId>(pipelineId: T) {
  const pipelineState = usePipelineState(pipelineId);
  const pipelineActions = usePipelineStateAction(pipelineId);
  const { dispatch: stageDispatcher, getStageState } = usePipelineStageActions(pipelineId);

  const run = async (input: string, callbacks?: SSECallbacks) => {
    // 防止重复运行
    if (pipelineState?.isRunning) return;

    // 1. 构建消息上下文
    const messages: ModelMessage[] = [];
    const { previousUserInput, finalOutput } = pipelineState || {};

    // 如果有上一轮对话上下文，插入历史记录
    if (previousUserInput && finalOutput) {
      messages.push({ role: "user", content: previousUserInput });
      // 将 finalOutput 序列化为字符串（如果是对象）
      const assistantContent =
        typeof finalOutput === "string" ? finalOutput : JSON.stringify(finalOutput, null, 2);
      messages.push({ role: "assistant", content: assistantContent });
    }

    // 始终添加当前用户输入
    messages.push({ role: "user", content: input });

    // 2. 开始运行 pipeline
    pipelineActions.start(input);

    try {
      await consumeSSE(
        { messages, typeId: pipelineId },
        {
          onStart: data => {
            // 当 stage 开始时，更新 pipeline 的当前 stage
            pipelineActions.setCurrentStage(data.id);
            stageDispatcher({
              stageId: data.id,
              event: {
                status: "running",
                error: undefined,
                type: "start",
              },
            });
            callbacks?.onStart?.(data);
          },
          onDelta: data => {
            stageDispatcher({
              stageId: data.id,
              event: {
                snapshot: data.snapshot,
                type: "append",
              },
            });
            callbacks?.onDelta?.(data);
          },
          onFinal: data => {
            // 获取当前 stage 状态，合并最终数据
            const currentStage = getStageState(data.id);
            const mergedFinal = mergeData(currentStage?.final, data.final);

            stageDispatcher({
              stageId: data.id,
              event: {
                status: "done",
                snapshot: mergedFinal,
                final: mergedFinal,
                type: "finish",
              },
            });
            pipelineActions.finish(mergedFinal);
            callbacks?.onFinal?.(data);
          },
          onError: data => {
            // 标记 stage 错误
            stageDispatcher({
              stageId: data.id,
              event: {
                status: "error",
                type: "error",
                error: data.error,
              },
            });
            pipelineActions.fail(data.error);
            callbacks?.onError?.(data);
          },
        }
      );
    } catch (error) {
      pipelineActions.fail(
        error instanceof Error ? JSON.stringify(error.message) : "usePipeline error"
      );
    }
  };

  return {
    run,
  };
}
