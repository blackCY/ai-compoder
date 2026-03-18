import { cn } from "lib/utils";
import { HomeProps } from "./types";
import { BackgroundElements } from "./components/BackgroundElements";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { PipelineGrid } from "./components/PipelineGrid";
import { getPipelines } from "actions/pipeline/getPipelines";

export default async function Home({ className }: HomeProps) {
  // Fetch pipelines server-side for Full Route Cache
  const pipelines = await getPipelines();

  return (
    <main className={cn("min-h-screen bg-[#0a0a0a] relative overflow-hidden", className)}>
      <BackgroundElements />
      <Navigation />
      <HeroSection />
      <FeaturesSection />

      {/* Pipeline Grid Section */}
      <section
        className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24"
        id="pipelines"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-white to-emerald-400 bg-clip-text text-transparent mb-4">
            可用功能
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">选择一个 pipeline 开始您的 AI 开发之旅</p>
        </div>
        <PipelineGrid initialPipelines={pipelines} />
      </section>
    </main>
  );
}
