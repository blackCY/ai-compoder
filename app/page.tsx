import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chat } from "@/components/biz/chat";
import { Sparkles, Code, Zap, Shield } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                AI Compoder
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium relative group"
              >
                特性
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#chat"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium relative group"
              >
                体验
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-24 sm:pb-32">
          <div className="text-center relative z-10">
            <div className="inline-flex items-center px-4 py-2 mb-8 text-sm font-medium text-emerald-300 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-full transition-all duration-300 hover:scale-105 animate-fade-in-scale opacity-0">
              <Sparkles className="w-4 h-4 mr-2" />
              AI 驱动的智能代码生成
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-8 leading-tight animate-fade-in-scale opacity-0" style={{ animationDelay: "0.2s" }}>
              让 AI
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {" "}加速{" "}
              </span>
              <br />
              你的开发
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-scale opacity-0" style={{ animationDelay: "0.4s" }}>
              基于 AI 的智能代码生成平台，严格使用内部组件库，快速构建高质量的业务页面。
              <br className="hidden sm:block" />
              体验流式代码生成，享受类型安全的开发环境。
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              为什么选择 AI Compoder？
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              结合最前沿的 AI 技术和严格的组件规范，为您提供前所未有的开发体验
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm transform-optimized">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/30 transform-optimized">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white group-hover:text-emerald-400 transition-colors duration-300">智能代码生成</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  基于 AI 的智能代码理解和生成，准确把握业务需求，生成高质量代码
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm transform-optimized">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30 transform-optimized">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors duration-300">组件库复用</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  严格使用内部组件库，确保设计一致性和代码质量，避免重复开发
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 hover:-translate-y-1 border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm transform-optimized">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-teal-500/30 transform-optimized">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white group-hover:text-teal-400 transition-colors duration-300">流式输出</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  实时代码生成，流畅的交互体验，边生成边展示，提升开发效率
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm transform-optimized">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30 transform-optimized">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors duration-300">类型安全</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  完整的 TypeScript 支持，类型安全的开发环境，减少运行时错误
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section id="chat" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 animate-fade-in-scale opacity-0" style={{ animationDelay: "0.6s" }}>开始体验</h2>
            <p className="text-gray-400 max-w-2xl mx-auto animate-fade-in-scale opacity-0" style={{ animationDelay: "0.8s" }}>
              在下方描述您的需求，让 AI 为您生成专业的代码解决方案
            </p>
          </div>
          <Suspense fallback={<Skeleton />}>
            <Chat />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
