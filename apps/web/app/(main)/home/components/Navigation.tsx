import { Cpu } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-2xl border-b border-emerald-500/10 shadow-2xl transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                AI Compoder
              </span>
              <span className="text-xs text-emerald-400/60 font-mono">v2.0</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-10">
            <a
              href="#features"
              className="text-slate-300 hover:text-emerald-400 transition-all duration-300 text-sm font-semibold tracking-wide relative group py-2"
            >
              特性
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
            <a
              href="#pipelines"
              className="text-slate-300 hover:text-emerald-400 transition-all duration-300 text-sm font-semibold tracking-wide relative group py-2"
            >
              体验
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};