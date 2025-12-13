"use client";

interface EditorSidebarProps {
  fileNames: string[];
  currentFileName: string | null;
  onFileSelect: (fileName: string) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  fileNames,
  currentFileName,
  onFileSelect,
}) => {
  return (
    <aside className="bg-[#0a0b0e] border-r border-[#23252b] p-5 text-sm text-[#888b96]">
      <div className="mb-4 font-semibold tracking-widest text-xs text-[#888b96]">EXPLORER</div>
      {fileNames.length > 0 ? (
        fileNames.map((fileName, index) => (
          <div
            key={index}
            onClick={() => onFileSelect(fileName)}
            className={`py-2 px-2 rounded cursor-pointer transition-colors duration-200 ${
              currentFileName === fileName
                ? "text-[#ffbe0b] font-semibold bg-[#23252b]/30"
                : "text-[#888b96] hover:text-[#e1e3e8] hover:bg-[#23252b]/20"
            }`}
          >
            {fileName}
          </div>
        ))
      ) : (
        <div className="py-2 text-[#888b96] opacity-60">No files generated yet</div>
      )}
    </aside>
  );
};
