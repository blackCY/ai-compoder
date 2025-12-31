import { Suspense } from "react";
import { ConfigurationPageContent } from "./components/ConfigurationPageContent";
import ConfigurationLoading from "./loading";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ISR：60秒后重新验证
export const revalidate = 60;

// 静态生成核心 pipelines（硬编码）
export async function generateStaticParams() {
  return [
    { id: "ddce61b4-06df-4145-a45f-52c3161eb916" },
  ];
}

export default async function ConfigurationPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ConfigurationLoading />}>
      <ConfigurationPageContent pipelineId={id} />
    </Suspense>
  );
}
