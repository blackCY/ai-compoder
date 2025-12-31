import { EditorPageContent } from "./components/EditorPageContent";
import type { PipelineId } from "@/lib/store/pipeline/types";

interface PageProps {
  searchParams: Promise<{ name?: PipelineId; id?: string }>;
}

export default async function EditorPage({ searchParams }: PageProps) {
  const { name, id } = await searchParams;

  if (!id) {
    return (
      <div className="min-h-screen bg-[#0a0b0e] flex items-center justify-center text-[#e1e3e8]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-red-400">
            Missing Pipeline ID
          </h2>
          <p className="text-gray-400">
            Please provide a pipeline ID in the URL.
          </p>
        </div>
      </div>
    );
  }

  return <EditorPageContent name={name} id={id} />;
}
