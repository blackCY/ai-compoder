import { EditorPageContent } from "./components/EditorPageContent";
import type { PipelineId } from "lib/store/pipeline/types";
import EditorLoading from "./loading";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ name: PipelineId; id: string }>;
}

// ISR：60秒后重新验证
export const revalidate = 60;

export default async function EditorPage({ searchParams }: PageProps) {
  const { name, id } = await searchParams;

  return (
    <Suspense fallback={<EditorLoading />}>
      <EditorPageContent name={name} id={id} />
    </Suspense>
  );
}
