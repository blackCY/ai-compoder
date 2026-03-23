import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ConfigurationPageContent } from "./components/ConfigurationPageContent";
import ConfigurationLoading from "./loading";

import { getQueryClient } from "lib/serverStore";
import { fetchPipelines, fetchStagesFull } from "db/queries";
import { Pipeline } from "lib/services/pipeline/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ISR：60秒后重新验证
export const revalidate = 60;

/**
 * 生成静态参数
 * 在构建时预渲染已知的 pipeline 页面
 */
export async function generateStaticParams() {
  // 构建时使用环境变量或默认 localhost
  const buildApiUrl = process.env.BUILD_API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${buildApiUrl}/api/pipelines`, {
      // 构建时的缓存策略
      next: { revalidate: 3600 }, // 1小时
    });

    if (!response.ok) {
      console.warn('Failed to fetch pipelines for generateStaticParams:', response.statusText);
      return [];
    }

    const pipelines: Pipeline[] = await response.json();
    return pipelines.map((pipeline) => ({
      id: pipeline.id,
    }));
  } catch (error) {
    console.warn('Error in generateStaticParams:', error);
    // 如果构建时无法获取数据，返回空数组
    // 这样新创建的 pipeline 会使用 SSR
    return [];
  }
}

export default async function ConfigurationPage({ params }: PageProps) {
  const { id } = await params;

  // 创建服务端 QueryClient
  const queryClient = getQueryClient();

  // 直接使用数据库查询，避免 HTTP 调用的开销和环境问题
  const [pipelines, stages] = await Promise.all([
    fetchPipelines(),
    fetchStagesFull(id),
  ]);

  const pipeline = pipelines.find((p) => p.id === id);

  // 预填充 TanStack Query 缓存，供客户端使用
  queryClient.setQueryData(["pipelines", id], pipeline);
  queryClient.setQueryData(["pipelines", id, "stages"], stages);

  // 将预取的数据传递给客户端
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<ConfigurationLoading />}>
        <ConfigurationPageContent pipelineId={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
