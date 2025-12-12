"use client";

import { useState, useEffect } from "react";
import { usePipeline, usePipelineState, useStage } from "@/lib/store/pipeline";

// ============================================
// Stage 1: Design Phase Display
// ============================================

function Stage1Display() {
  const { status, snapshot, final, error } = useStage(
    "business-code-generate",
    "stage-1"
  );
  const data = final || snapshot;

  if (status === "idle" && !data) return null;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          🎨 Design Phase
          <span className="ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {status}
          </span>
        </h3>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-200">
          ❌ {error}
        </div>
      )}

      {data ? (
        <div className="space-y-6">
          {/* Analysis Section */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Analysis
            </h4>
            <div className="rounded-lg bg-gray-50 p-4 text-gray-700 dark:bg-gray-900 dark:text-gray-300 whitespace-pre-wrap">
              {data.analysis || "Analyzing requirements..."}
            </div>
          </div>

          {/* Selected Components Section */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Selected Components
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              {data.selectedComponents?.map((comp, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="mb-2 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {comp.name}
                  </div>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {comp.description}
                  </p>
                  <div className="rounded bg-gray-100 p-2 text-xs font-mono text-gray-500 dark:bg-gray-950 dark:text-gray-500">
                    {/* {comp.api} */}
                  </div>
                </div>
              ))}
              {!data.selectedComponents?.length && status === "running" && (
                <div className="col-span-2 py-8 text-center text-gray-400 animate-pulse">
                  Selecting suitable components...
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-400">Waiting for design task...</div>
      )}
    </div>
  );
}

// ============================================
// Stage 2: Coding Phase Display
// ============================================

function Stage2Display() {
  const { status, snapshot, final, error } = useStage(
    "business-code-generate",
    "stage-2"
  );
  const data = final || snapshot;
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (data?.files?.length && !activeTab) {
      setActiveTab(data.files[0].fileName);
    }
  }, [data?.files, activeTab]);

  if (status === "idle" && !data) return null;

  const currentFile = data?.files?.find(f => f.fileName === activeTab);

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          💻 Coding Phase
          <span className="ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {status}
          </span>
        </h3>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-200">
          ❌ {error}
        </div>
      )}

      {data?.files?.length ? (
        <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          {/* File Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            {data.files.map((file, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(file.fileName)}
                className={`border-r border-gray-200 px-4 py-2 text-sm font-medium transition-colors dark:border-gray-800 ${
                  activeTab === file.fileName
                    ? "bg-white text-blue-600 dark:bg-gray-950 dark:text-blue-400"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {file.fileName}
              </button>
            ))}
          </div>

          {/* File Content */}
          <div className="relative min-h-[300px] bg-gray-50 p-4 font-mono text-sm dark:bg-gray-950">
            {currentFile ? (
              <pre className="overflow-x-auto whitespace-pre">
                <code className="text-gray-800 dark:text-gray-200">{currentFile.content}</code>
              </pre>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Select a file to view content
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-gray-400">
          {status === "running" ? "Generating code..." : "Waiting for coding task..."}
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Pipeline Page
// ============================================

function PipelineContent() {
  const [input, setInput] = useState("");
  const { run } = usePipeline();
  const { isRunning } = usePipelineState();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      run(input, "business-code-generate");
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          🚀 AI Development Pipeline
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Automated design to code workflow</p>
      </div>

      <div className="mb-10 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your requirements (e.g., 'Create a login form with email and password')"
            className="w-full resize-none rounded-lg border-0 bg-transparent p-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-sm sm:leading-6"
            rows={3}
          />
          <div className="flex justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="text-xs text-gray-400 py-2">Supported: Components, Layouts, Forms</div>
            <button
              type="submit"
              disabled={isRunning || !input.trim()}
              className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all
                ${
                  isRunning
                    ? "bg-blue-400 cursor-not-allowed opacity-75"
                    : "bg-blue-600 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                }`}
            >
              {isRunning ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                "Start Pipeline"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-8">
        <Stage1Display />
        <Stage2Display />
      </div>
    </div>
  );
}

export default function PipelinePage() {
  return <PipelineContent />;
}
