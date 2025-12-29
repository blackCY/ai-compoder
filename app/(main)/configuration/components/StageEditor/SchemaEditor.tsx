"use client";

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { JsonSchema } from 'json-schema-to-zod';

interface SchemaEditorProps {
  value: JsonSchema | null;
  onChange: (value: JsonSchema | null) => void;
  disabled?: boolean;
}

export function SchemaEditor({ value, onChange, disabled }: SchemaEditorProps) {
  const [hasSchema, setHasSchema] = useState(value !== null);
  const [editorValue, setEditorValue] = useState(
    value ? JSON.stringify(value, null, 2) : '{\n  \n}'
  );
  const [error, setError] = useState<string | null>(null);

  const handleToggleSchema = () => {
    if (hasSchema) {
      onChange(null);
      setHasSchema(false);
    } else {
      setHasSchema(true);
      try {
        const parsed = JSON.parse(editorValue);
        onChange(parsed);
      } catch (e) {
        // Keep schema enabled but don't update value if invalid
      }
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setEditorValue(value);
    
    if (!hasSchema) return;

    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(editorValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditorValue(formatted);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Schema (Optional)</label>
        <div className="flex gap-2">
          {hasSchema && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFormat}
              disabled={disabled}
              className="h-7 text-xs"
            >
              Format
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleSchema}
            disabled={disabled}
            className="h-7 text-xs"
          >
            {hasSchema ? 'Remove Schema' : 'Add Schema'}
          </Button>
        </div>
      </div>

      {hasSchema && (
        <>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Editor
              height="300px"
              defaultLanguage="json"
              value={editorValue}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                readOnly: disabled,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
          {error && (
            <div className="text-xs text-red-400">
              {error}
            </div>
          )}
        </>
      )}

      {!hasSchema && (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-gray-500">No schema defined</p>
        </div>
      )}
    </div>
  );
}
