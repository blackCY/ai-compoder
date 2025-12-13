import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Monaco
export const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-slate-400">Loading editor...</div>
    </div>
  ),
});
