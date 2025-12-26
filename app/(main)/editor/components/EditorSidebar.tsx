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
    <aside className="bg-[#0a0b0e] border-r border-[#23252b] p-5 text-sm text-[#888b96] flex flex-col">
      <div className="mb-4 font-semibold tracking-widest text-xs text-[#888b96]">EXPLORER</div>

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
                  ? "text-[#ffbe0b] font-semibold bg-[#23252b]/30"
                  : disabled
                    ? "text-[#888b96] opacity-60"
                    : "text-[#888b96] hover:text-[#e1e3e8] hover:bg-[#23252b]/20"
              }`}
            >
              <span>{fileName}</span>
            </div>
          ))
        ) : (
          <div className="py-2 text-[#888b96] opacity-60">No files generated yet</div>
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
            className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded
                       bg-amber-500/30 hover:bg-amber-500/50 text-amber-300
                       transition-colors duration-200"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      )}
    </aside>
  );
};
