"use client";

import { useState } from "react";
import { Plus, Trash2, Key, Info, Globe, ChevronDown, ChevronUp, FileJson } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "lib/ui/button";
import { Input } from "lib/ui/input";
import { Textarea } from "lib/ui/textarea";
import { cn } from "lib/utils";
import { Stage } from "lib/services/pipeline/types";
import { toast } from "sonner";

// Extract the type of the resources data from Stage
type ResourceData = NonNullable<NonNullable<Stage["resources"]>["data"]>;

interface ResourceItem {
  key: string;
  description: string;
  api: string;
}

interface ResourceEditorProps {
  value: ResourceData | null | undefined;
  onChange: (value: ResourceData | null) => void;
  disabled?: boolean;
}

export function ResourceEditor({ value, onChange, disabled }: ResourceEditorProps) {
  const [newItem, setNewItem] = useState<ResourceItem>({ key: "", description: "", api: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const resources = value || {};
  const resourceKeys = Object.keys(resources);

  const handleAdd = () => {
    if (!newItem.key.trim() || !newItem.api.trim()) return;

    const updated: ResourceData = {
      ...resources,
      [newItem.key]: {
        description: newItem.description,
        api: newItem.api,
      },
    };
    onChange(updated);
    setNewItem({ key: "", description: "", api: "" });
    setIsAdding(false);
  };

  const handleEditorChange = (val: string | undefined) => {
    try {
      const parsed = JSON.parse(val || "{}");
      if (typeof parsed !== "object" || parsed === null) return;

      // Basic validation of structure
      for (const key in parsed) {
        if (typeof parsed[key] !== "object" || !parsed[key].api) return;
      }

      onChange(parsed);
    } catch (e) {
      toast.error(JSON.stringify(e));
    }
  };

  const handleRemove = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...resources };
    delete updated[key];
    onChange(Object.keys(updated).length > 0 ? updated : null);
    if (expandedKey === key) setExpandedKey(null);
  };

  const toggleExpand = (key: string) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-emerald-400/80 uppercase tracking-wider">
          Resources
        </label>
        <div className="flex gap-2">
          {!isAdding && !isImporting && !disabled && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsImporting(true)}
                className="text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10 h-8 px-2"
              >
                <FileJson className="h-4 w-4 mr-1 opacity-70" />
                Import JSON
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(true)}
                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-8 px-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Single
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Import JSON Form */}
        {isImporting && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 max-w-[608px]">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Resource JSON Editor
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsImporting(false)}
                className="h-6 text-[10px] text-gray-500 hover:text-white px-2"
              >
                Close Editor
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-950/30">
              <Editor
                height="300px"
                defaultLanguage="json"
                value={JSON.stringify(resources, null, 2)}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  readOnly: disabled,
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
            <p className="text-[10px] text-gray-500 italic pl-1">
              Live editing: changes are saved instantly when JSON is valid.
            </p>
          </div>
        )}

        {/* Adding form at the top */}
        {isAdding && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 max-w-[608px]">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest pl-1">
                  Resource Key
                </label>
                <Input
                  value={newItem.key}
                  onChange={e => setNewItem(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="e.g., product_catalog"
                  className="bg-emerald-950/20 border-emerald-500/10 h-9 text-sm text-white focus:ring-emerald-500/20 focus:border-emerald-500/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest pl-1">
                  Api
                </label>
                <Input
                  value={newItem.api}
                  onChange={e => setNewItem(prev => ({ ...prev, api: e.target.value }))}
                  placeholder="Complete documentation of resource"
                  className="bg-emerald-950/20 border-emerald-500/10 h-9 text-sm text-white focus:ring-emerald-500/20 focus:border-emerald-500/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest pl-1">
                  Description
                </label>
                <Textarea
                  value={newItem.description}
                  onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this resource used for?"
                  className="bg-emerald-950/20 border-emerald-500/10 min-h-[80px] text-sm text-white focus:ring-emerald-500/20 focus:border-emerald-500/30 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!newItem.key.trim() || !newItem.api.trim()}
                onClick={handleAdd}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white"
              >
                Add Resource
              </Button>
            </div>
          </div>
        )}

        {resourceKeys.length === 0 && !isAdding && !isImporting ? (
          <div className="rounded-2xl border border-dashed border-emerald-500/10 bg-emerald-950/10 p-8 text-center group/resource hover:bg-emerald-950/20 transition-colors max-w-[608px]">
            <p className="text-gray-400 font-medium">No resources attached</p>
            <p className="text-xs text-gray-500 mt-2">Add external APIs or data sources for this stage</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {resourceKeys.map(key => (
              <div key={key} className="space-y-2 max-w-[608px]">
                <div
                  onClick={() => toggleExpand(key)}
                  className={cn(
                    "group relative flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer border",
                    expandedKey === key
                      ? "bg-emerald-950/30 border-emerald-500/40"
                      : "bg-emerald-950/20 border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-950/30"
                  )}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-emerald-400/60" />
                      <span className="font-mono text-sm font-semibold text-white tracking-tight">
                        {key}
                      </span>
                    </div>
                    {resources[key].description && (
                      <div className="flex items-start gap-2">
                        <Info className="h-3.5 w-3.5 text-gray-400/40 mt-0.5 shrink-0" />
                        <p className={cn(
                          "text-xs text-gray-400 leading-relaxed",
                          expandedKey !== key && "line-clamp-2"
                        )}>
                          {resources[key].description}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-blue-400/40 shrink-0" />
                      <span className="text-[10px] font-mono text-gray-500 truncate">
                        {resources[key].api}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {!disabled && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleRemove(key, e)}
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {expandedKey === key ? (
                      <ChevronUp className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-600 group-hover:text-emerald-500/50" />
                    )}
                  </div>
                </div>

                {/* Expanded Detail View */}
                {expandedKey === key && (
                  <div className="mx-2 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/10 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                          Full Api
                        </span>
                        <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/10 text-[11px] font-mono text-blue-400/80 break-all">
                          {resources[key].api}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                          Full Description
                        </span>
                        <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/10 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {resources[key].description || "No description provided"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
