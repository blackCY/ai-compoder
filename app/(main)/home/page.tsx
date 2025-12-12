import { cn } from "@/lib/utils";
import { HomeProps } from "./types";
import { BackgroundElements } from "./components/BackgroundElements";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { ChatSection } from "./components/ChatSection";

export default function Home({ className }: HomeProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-[#0a0a0a] relative overflow-hidden",
        className
      )}
    >
      <BackgroundElements />
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <ChatSection />
    </main>
  );
}
