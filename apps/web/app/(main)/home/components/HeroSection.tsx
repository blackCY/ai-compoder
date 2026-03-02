import { Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-24 sm:pb-32">
        <div className="text-center relative z-10">
          {/* Floating badge */}
          <div className="inline-flex items-center px-6 py-3 mb-12 text-sm font-bold text-emerald-300 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-md border border-emerald-500/20 rounded-full transition-all duration-500 hover:scale-105 hover:border-emerald-400/40 animate-fade-in-scale opacity-0 shadow-2xl shadow-emerald-500/20">
            <Sparkles
              className="w-4 h-4 mr-2 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            AI 驱动的智能代码生成
            <div className="ml-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>

          {/* Main headline with enhanced typography */}
          <div className="relative mb-12">
            <h1
              className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-200 to-cyan-200 leading-[1.1] tracking-tight animate-fade-in-scale opacity-0"
              style={{ animationDelay: "0.2s" }}
            >
              让 AI
              <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-shimmer">
                加速开发
              </span>
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl opacity-50 animate-pulse"></div>
          </div>

          {/* Enhanced description */}
          <p
            className="text-xl md:text-2xl text-slate-300 mb-16 max-w-4xl mx-auto leading-relaxed animate-fade-in-scale opacity-0 font-light"
            style={{ animationDelay: "0.4s" }}
          >
            基于 AI 的智能代码生成平台，严格使用内部组件库，
            <br className="hidden sm:block" />
            <span className="text-emerald-400 font-semibold">快速构建高质量的业务页面</span>，
            <br className="hidden sm:block" />
            体验流式代码生成，享受类型安全的开发环境。
          </p>
        </div>
      </div>
    </section>
  );
};