/**
 * PipelineGrid 骨架屏组件
 * 用于动态组件加载时的占位显示
 */
export const PipelineGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-[340px] rounded-2xl border border-white/5 bg-white/5 p-8 animate-pulse"
      >
        <div className="h-12 w-12 rounded-xl bg-white/10 mb-6" />
        <div className="h-6 w-3/4 rounded-lg bg-white/10 mb-3" />
        <div className="h-16 w-full rounded-lg bg-white/5 mb-8" />
        <div className="h-6 w-20 rounded-full bg-white/10 mb-4" />
        <div className="flex gap-3 border-t border-white/5 pt-4">
          <div className="flex-1 h-10 rounded-lg bg-white/10" />
          <div className="w-28 h-10 rounded-lg bg-white/10" />
        </div>
      </div>
    ))}
  </div>
);
