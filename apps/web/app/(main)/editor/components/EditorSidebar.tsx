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
    <aside className="bg-emerald-950/30 border-r border-emerald-500/10 p-5 text-sm flex flex-col h-full">
      <div className="mb-4 font-semibold tracking-widest text-xs text-white">文件列表</div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-auto">
        {fileNames.length > 0 ? (
          fileNames.map(fileName => (
            <div
              key={fileName}
              onClick={() => !disabled && onFileSelect(fileName)}
              className={`py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                disabled ? "cursor-default" : "cursor-pointer"
              } ${
                activeFileName === fileName
                  ? "text-white font-semibold bg-emerald-500/30 border border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                  : disabled
                    ? "text-slate-400 opacity-60"
                    : "text-slate-200 hover:text-white hover:bg-emerald-500/20 border border-transparent hover:border-emerald-500/30"
              }`}
              style={{ willChange: 'transform' }}
            >
              <span>{fileName}</span>
            </div>
          ))
        ) : (
          <div className="py-8 px-4 text-center rounded-xl border border-dashed border-emerald-500/40">
            <div className="text-white mb-2 font-medium">还没有文件生成</div>
            <div className="text-white text-xs">请在左侧输入需求开始生成</div>
          </div>
        )}
      </div>

      {/* 保存提示 - 底部 */}
      {hasUnsavedChanges && (
        <div className="pt-4 mt-2 border-t border-emerald-500/30 bg-emerald-900/40 -mx-5 px-5 pb-5 -mb-5">
          <div className="flex items-center gap-2 text-white text-sm mb-3 font-medium">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            <span>有更改未保存</span>
          </div>
          <button
            onClick={onSave}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
            <Save className="w-4 h-4" />
            保存更改
          </button>
        </div>
      )}
    </aside>
  );
};
