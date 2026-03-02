import { Suspense } from "react";
import { ConfigurationPageContent } from "./components/ConfigurationPageContent";
import ConfigurationLoading from "./loading";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ISR：60秒后重新验证
export const revalidate = 60;

export default async function ConfigurationPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ConfigurationLoading />}>
      <ConfigurationPageContent pipelineId={id} />
    </Suspense>
  );
}
