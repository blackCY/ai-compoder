"use client";

interface EditorSidebarProps {
  fileNames: string[];
  activeFileName: string | null;
  onFileSelect: (fileName: string) => void;
  disabled?: boolean;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  fileNames,
  activeFileName,
  onFileSelect,
  disabled = false,
}) => {
  return (
    <aside className="bg-[#0a0b0e] border-r border-[#23252b] p-5 text-sm text-[#888b96]">
      <div className="mb-4 font-semibold tracking-widest text-xs text-[#888b96]">EXPLORER</div>
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
    </aside>
  );
};
