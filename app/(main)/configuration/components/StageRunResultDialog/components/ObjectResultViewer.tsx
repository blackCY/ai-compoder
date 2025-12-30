"use client";

import { CodeEditor } from "@/components/biz/CodeEditor";
import { Braces } from "lucide-react";

export interface ObjectResultViewerProps {
  data: Record<string, unknown>;
  isLoading?: boolean;
}

export function ObjectResultViewer({ data, isLoading = false }: ObjectResultViewerProps) {
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="h-full w-full">
      {Object.keys(data).length > 0 || isLoading ? (
        <CodeEditor
          code={jsonString}
          language="json"
          filename="output.json"
          readOnly={true}
          className="h-full"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3 border border-white/5 rounded-xl bg-black/60 backdrop-blur-xl shadow-inner">
          <Braces className="h-12 w-12 opacity-20" />
          <span className="text-sm">No output yet</span>
          <span className="text-xs text-gray-600">Enter input and run to see results</span>
        </div>
      )}
    </div>
  );
}
