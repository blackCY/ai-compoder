import { atom } from "jotai";
import { PipelineState, PipelineId, StageState } from "./types";
import { atomFamily } from "jotai/utils";

export const pipelineStateAtomFamily = atomFamily((_pipelineId: PipelineId) =>
  atom<PipelineState>({ isRunning: false })
);

export const pipelineStagesAtomFamily = atomFamily((_stageKey: string) =>
  atom<StageState>({ status: "idle" })
);
