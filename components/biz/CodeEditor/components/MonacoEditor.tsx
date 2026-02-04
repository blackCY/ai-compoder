import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";

// Configure monaco-editor to load from local files instead of CDN
loader.config({
  paths: {
    vs: "/monaco/vs",
  },
});

// Dynamic import to avoid SSR issues with Monaco
export const BaseCodeEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-slate-400">Loading editor...</div>
    </div>
  ),
});
