"use client";

import { Save } from "lucide-react";

interface EditorSidebarProps {
  fileNames: string[];
  activeFileName: string | null;
  onFileSelect: (fileName: string) => void;
  disabled?: boolean;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  fileNames,
  activeFileName,
  onFileSelect,
  disabled = false,
  hasUnsavedChanges = false,
  onSave,
}) => {
  return (
    <aside className="bg-emerald-950/30 border-r border-emerald-500/10 p-5 text-sm text-[#888b96] flex flex-col">
      <div className="mb-4 font-semibold tracking-widest text-xs text-[#888b96]">文件列表</div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-auto">
        {fileNames.length > 0 ? (
          fileNames.map(fileName => (
            <div
              key={fileName}
              onClick={() => !disabled && onFileSelect(fileName)}
              className={`py-2 px-2 rounded transition-colors duration-200 flex items-center gap-2 ${
                disabled ? "cursor-default" : "cursor-pointer"
              } ${
                activeFileName === fileName
                  ? "text-emerald-400 font-semibold bg-emerald-500/20 border border-emerald-500/30"
                  : disabled
                    ? "text-[#888b96] opacity-60"
                    : "text-[#888b96] hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200"
              }`}
              style={{ willChange: 'transform' }}
            >
              <span>{fileName}</span>
            </div>
          ))
        ) : (
          <div className="py-2 text-[#888b96] opacity-60">还没有文件生成...</div>
        )}
      </div>

      {/* 保存提示 - 底部 */}
      {hasUnsavedChanges && (
        <div className="pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-amber-300 text-sm mb-2">
            <span className="text-amber-400">●</span>
            <span>有更改未保存</span>
          </div>
          <button
            onClick={onSave}
            className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      )}
    </aside>
  );
};
