# Pipeline Store 使用指南

## 概述

Pipeline Store 现在支持多个 pipeline 类型的独立状态管理。每个 pipeline 类型都有自己的状态、stages 和历史记录。

## 架构变更

### 之前（单一 Pipeline）
```typescript
// 所有 pipeline 共享同一个状态
const { run } = usePipeline();
const { isRunning } = usePipelineState();
run(input, "business-code-generate");
```

### 现在（多 Pipeline 支持）
```typescript
// 每个 pipeline 类型有独立的状态
const { run } = usePipeline("business-code-generate");
const { isRunning } = usePipelineState("business-code-generate");
run(input); // typeId 已经在 hook 初始化时指定
```

## 核心概念

### 1. PipelineRegistry
定义所有支持的 pipeline 类型及其 stages 的输出类型：

```typescript
export interface PipelineRegistry {
  "business-code-generate": {
    "stage-1": { analysis: string; selectedComponents: Array<...> };
    "stage-2": { files: Array<...> };
  };
  // 未来可以添加更多 pipeline 类型
  "data-analysis": {
    "stage-1": { ... };
    "stage-2": { ... };
  };
}
```

### 2. 状态结构（分离式设计）

为了实现精确的渲染优化，状态被分为两个独立的 atom：

```typescript
// Pipeline 元数据（不包含 stages）
PipelinesMetaState = {
  "business-code-generate": {
    isRunning: boolean;
    error?: { stageId?: string; message: string };
    finalOutput: any | null;
    previousUserInput: string | null;
  };
  // 其他 pipeline 类型...
}

// Stages 独立存储（使用 "typeId:stageId" 作为 key）
StagesState = {
  "business-code-generate:stage-1": StageState;
  "business-code-generate:stage-2": StageState;
  // 其他 stages...
}
```

**设计优势**：
- 更新某个 stage 不会影响其他 stage 的订阅者
- 更新 pipeline 元数据不会影响 stage 订阅者
- 完全隔离，实现最优渲染性能

## API 使用

### usePipeline(typeId)
管理指定 pipeline 的运行：

```typescript
const { run } = usePipeline("business-code-generate");

// 运行 pipeline
await run("创建一个登录表单");
```

### usePipelineMeta(typeId)
获取指定 pipeline 的元数据（推荐，性能更好）：

```typescript
const { isRunning, error, finalOutput, previousUserInput } = 
  usePipelineMeta("business-code-generate");
```

### usePipelineState(typeId)
获取指定 pipeline 的完整状态（包含 stages）：

```typescript
const { isRunning, error, finalOutput, previousUserInput, stages } = 
  usePipelineState("business-code-generate");

// stages 是动态组合的，包含该 pipeline 的所有 stage
// 如果只需要元数据，推荐使用 usePipelineMeta 以获得更好的性能
```

### useStage(typeId, stageId)
获取指定 pipeline 的指定 stage 状态：

```typescript
const { status, snapshot, final, error } = useStage(
  "business-code-generate",
  "stage-1"
);

// TypeScript 会自动推断类型：
// snapshot: { analysis: string; selectedComponents: Array<...> }
// final: { analysis: string; selectedComponents: Array<...> }
```

## 添加新的 Pipeline 类型

### 1. 在 types.ts 中注册
```typescript
export interface PipelineRegistry {
  "business-code-generate": { ... };
  "new-pipeline-type": {
    "stage-1": { /* 定义输出类型 */ };
    "stage-2": { /* 定义输出类型 */ };
  };
}
```

### 2. 在 atoms.ts 中添加默认状态
```typescript
function createDefaultPipelinesState(): PipelinesState {
  const state = {} as PipelinesState;
  const pipelineTypes: PipelineTypeId[] = [
    "business-code-generate",
    "new-pipeline-type", // 添加新类型
  ];
  
  pipelineTypes.forEach((typeId) => {
    state[typeId] = { ...defaultSinglePipelineState };
  });
  
  return state;
}
```

### 3. 使用新的 Pipeline
```typescript
// 在组件中使用
const { run } = usePipeline("new-pipeline-type");
const { isRunning } = usePipelineState("new-pipeline-type");
const stage1 = useStage("new-pipeline-type", "stage-1");
```

## 优势

1. **完全解耦**：不同 pipeline 类型的状态完全独立，互不干扰
2. **类型安全**：TypeScript 自动推断每个 stage 的输出类型
3. **可扩展**：轻松添加新的 pipeline 类型
4. **精确渲染优化**：
   - 使用独立的 stage key（`typeId:stageId`）存储
   - 更新一个 stage 不会触发其他 stage 的重渲染
   - 更新 pipeline 元数据不会触发 stage 组件的重渲染
   - 使用 `selectAtom` 和 `shallowEqual` 确保最小化重渲染
5. **历史记录**：每个 pipeline 维护自己的对话历史
6. **性能分级**：
   - `usePipelineMeta`：只订阅元数据，最轻量
   - `useStage`：只订阅特定 stage，精确隔离
   - `usePipelineState`：获取完整状态，按需使用

## 示例

完整的使用示例请参考：
- `app/(main)/pipeline/page.tsx` - 完整的 pipeline 页面
- `components/biz/PipelineFloatingDock/PipelineFloatingDock.tsx` - 浮动面板集成
