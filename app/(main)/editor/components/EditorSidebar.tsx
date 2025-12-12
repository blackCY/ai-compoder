"use client";

export const EditorSidebar: React.FC = () => {
  return (
    <aside className="bg-[#0a0b0e] border-r border-[#23252b] p-5 text-sm text-[#888b96]">
      <div className="mb-4 font-semibold tracking-widest text-xs text-[#888b96]">EXPLORER</div>
      <div className="py-2 flex items-center text-[#ffbe0b] font-semibold cursor-pointer transition-colors duration-200">
        <span className="mr-2 opacity-60">⚛️</span> App.js
      </div>
      <div className="py-2 flex items-center text-[#888b96] hover:text-[#e1e3e8] cursor-pointer transition-colors duration-200">
        <span className="mr-2 opacity-60">🎨</span> styles.css
      </div>
    </aside>
  );
};
