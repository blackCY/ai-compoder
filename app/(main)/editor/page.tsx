import { EditorLayout, EditorFloatingDock } from "./components";

export default function EditorPage() {
  return (
    <div
      className="min-h-screen bg-[#0a0b0e] text-[#e1e3e8] font-['Syne',sans-serif] overflow-hidden"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Main Layout Grid */}
      <EditorLayout />

      {/* Floating Dock */}
      <EditorFloatingDock />
    </div>
  );
}
