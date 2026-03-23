# Configuration 页面性能优化总结

## 优化前 vs 优化后

### 优化前的渲染流程
```
服务端渲染空壳 → 下载 HTML → 客户端水合 → 并行获取 pipeline + stages → 渲染完整页面
↓
用户需要等待：网络传输 + 水合 + 两个 API 请求
```

### 优化后的渲染流程
```
服务端并行预取 pipeline + stages → HTML 已包含数据 → 下载 → 客户端水合 → 立即渲染
↓
用户只需要等待：网络传输（HTML 已包含数据）
```

## 实现的优化方案

### 方案 1：独立 Suspense 边界（已实现）
**文件**: `components/ConfigurationPageContent.tsx`

- 将 `PageHeader` 和 `StagesCanvas` 拆分为独立组件
- 每个组件有自己的 `Suspense` 边界和骨架屏
- 实现渐进式渲染：Header 先显示，Canvas 稍后显示

**效果**:
- 用户先看到页面标题和描述
- Canvas 区域显示加载状态
- 数据加载完成后显示完整 Canvas

### 方案 3：服务端预取数据（已实现）
**文件**: `page.tsx`

```tsx
// 创建服务端 QueryClient
const queryClient = getQueryClient();

// 并行预取数据（在服务端执行）
await Promise.all([
  queryClient.fetchQuery({
    queryKey: ["pipelines", id],
    queryFn: () => getPipeline(id),
  }),
  queryClient.fetchQuery({
    queryKey: ["pipelines", id, "stages"],
    queryFn: () => getStages(id),
  }),
]);

// 将预取的数据传递给客户端
<HydrationBoundary state={dehydratedState}>
  <ConfigurationPageContent pipelineId={id} />
</HydrationBoundary>
```

**效果**:
- HTML 中已包含完整数据
- 客户端无需额外 API 请求
- 首次渲染即显示完整内容
- 配合 ISR 缓存，进一步提升性能

## 性能提升预估

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| TTFB (Time to First Byte) | ~100ms | ~200ms* | -100ms |
| HTML 下载 | ~10KB | ~15KB** | -5KB |
| 客户端 API 请求 | 2个 | 0个 | -2个 |
| Time to Interactive | ~2s | ~0.5s | **-75%** |

*服务端需要额外时间获取数据
**HTML 包含预取数据，体积略增

## 架构变更

### 新增文件
- `lib/server-store/queryClient.ts` - 服务端/客户端 QueryClient 工具

### 修改文件
- `page.tsx` - 添加服务端预取逻辑
- `components/ConfigurationPageContent.tsx` - 拆分 Suspense 边界

## 可选的进一步优化

### 方案 2：延迟加载 ReactFlow
如果 ReactFlow 库（~100KB+）影响初始加载，可以使用 `React.lazy`：

```tsx
const StageFlowCanvas = lazy(() => import("./StageFlowCanvas"));

// 使用时
<Suspense fallback={<CanvasSkeleton />}>
  <StageFlowCanvas ... />
</Suspense>
```

### 方案 4：静态生成 (SSG)
如果 pipeline 数据不经常变化，可以使用 `generateStaticParams` 预生成所有页面：

```tsx
export async function generateStaticParams() {
  const pipelines = await getPipelines();
  return pipelines.map((p) => ({ id: p.id }));
}
```

## 注意事项

1. **ISR 缓存**: 当前设置为 60 秒重新验证，可根据数据更新频率调整
2. **QueryKey 一致性**: 确保服务端和客户端使用相同的 queryKey
3. **错误处理**: 服务端获取失败会触发错误边界，需要相应的 error.tsx
