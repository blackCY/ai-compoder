import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "lib/ui/card";
import { Code, Layers, Zap, Eye } from "lucide-react";

interface Feature {
  icon: typeof Code;
  title: string;
  description: string;
  gradientColors: {
    from: string;
    to: string;
    shadow: string;
  };
  borderColors: {
    border: string;
    bg: string;
  };
  hoverColors: {
    text: string;
    bg: string;
  };
}

const features: Feature[] = [
  {
    icon: Code,
    title: "智能代码生成",
    description: "基于 AI 的业务组件智能代码理解和生成，准确把握业务需求，生成高质量代码",
    gradientColors: {
      from: "from-emerald-500",
      to: "to-emerald-700",
      shadow: "shadow-emerald-500/40"
    },
    borderColors: {
      border: "border-emerald-500/20",
      bg: "from-slate-900/95 to-emerald-950/30"
    },
    hoverColors: {
      text: "text-emerald-300",
      bg: "hover:shadow-emerald-500/30"
    }
  },
  {
    icon: Layers,
    title: "组件库复用",
    description: "严格使用内部组件库，确保设计一致性和代码质量，避免重复开发",
    gradientColors: {
      from: "from-blue-500",
      to: "to-blue-700",
      shadow: "shadow-blue-500/40"
    },
    borderColors: {
      border: "border-blue-500/20",
      bg: "from-slate-900/95 to-blue-950/30"
    },
    hoverColors: {
      text: "text-blue-300",
      bg: "hover:shadow-blue-500/30"
    }
  },
  {
    icon: Eye,
    title: "实时编辑与查看",
    description: "AI 生成的代码可实时编辑调整，保存后即时预览效果，快速迭代优化",
    gradientColors: {
      from: "from-purple-500",
      to: "to-purple-700",
      shadow: "shadow-purple-500/40"
    },
    borderColors: {
      border: "border-purple-500/20",
      bg: "from-slate-900/95 to-purple-950/30"
    },
    hoverColors: {
      text: "text-purple-300",
      bg: "hover:shadow-purple-500/30"
    }
  },
  {
    icon: Zap,
    title: "流式输出",
    description: "实时代码生成，流畅的交互体验，边生成边展示，提升开发效率",
    gradientColors: {
      from: "from-teal-500",
      to: "to-teal-700",
      shadow: "shadow-teal-500/40"
    },
    borderColors: {
      border: "border-teal-500/20",
      bg: "from-slate-900/95 to-teal-950/30"
    },
    hoverColors: {
      text: "text-teal-300",
      bg: "hover:shadow-teal-500/30"
    }
  }
];

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const { icon: Icon, title, description, gradientColors, borderColors, hoverColors } = feature;

  return (
    <Card className={`group relative overflow-hidden hover:shadow-2xl ${hoverColors.bg} transition-all duration-500 hover:-translate-y-2 ${borderColors.border} bg-gradient-to-br ${borderColors.bg} backdrop-blur-xl`}>
      <div className={`absolute inset-0 bg-gradient-to-br from-${feature.gradientColors.from.split('-')[1]}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-${feature.gradientColors.from.split('-')[1]}-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
      <CardHeader className="relative z-10 pb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradientColors.from} ${gradientColors.to} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl ${gradientColors.shadow}`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <CardTitle className={`text-xl font-bold text-white group-hover:${hoverColors.text} transition-colors duration-300`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <CardDescription className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300 text-sm">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-8">
            为什么选择 AI Compoder？
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            结合最前沿的 AI 技术和严格的组件规范，为您提供前所未有的开发体验
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};