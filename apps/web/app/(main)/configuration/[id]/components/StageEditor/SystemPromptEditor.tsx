"use client";

import { Textarea } from "lib/ui/textarea";

interface SystemPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SystemPromptEditor({ value, onChange, disabled }: SystemPromptEditorProps) {
  const charCount = value.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-emerald-400/80">System Prompt</label>
        <span className="text-xs text-gray-500">{charCount} characters</span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter system prompt..."
        className="min-h-[200px] resize-y font-mono text-sm bg-emerald-950/20 border-emerald-500/10 text-white placeholder:text-gray-500 focus:border-emerald-500/30 focus:ring-emerald-500/20 disabled:opacity-50"
      />
    </div>
  );
}
