import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { ConfigurationPageContent } from "./components/ConfigurationPageContent";
import ConfigurationLoading from "./loading";

import { getQueryClient } from "lib/serverStore";
import { Pipeline, Stage } from "lib/services/pipeline/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ISR：60秒后重新验证
export const revalidate = 60;

export default async function ConfigurationPage({ params }: PageProps) {
  const { id } = await params;

  // 创建服务端 QueryClient
  const queryClient = getQueryClient();

  // 获取当前请求的完整 URL（Next.js 15 中 headers() 返回 Promise）
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const serverUrl = `${protocol}://${host}`;

  // 并行预取数据
  await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["pipelines", id],
      queryFn: async (): Promise<Pipeline> => {
        const response = await fetch(`${serverUrl}/api/pipelines/${id}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch pipeline: ${response.statusText}`);
        }
        return response.json();
      },
    }),
    queryClient.fetchQuery({
      queryKey: ["pipelines", id, "stages"],
      queryFn: async (): Promise<Stage[]> => {
        const response = await fetch(`${serverUrl}/api/pipelines/${id}/stages`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch stages: ${response.statusText}`);
        }
        return response.json();
      },
    }),
  ]);

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
