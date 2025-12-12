import { PipelineFloatingDock } from "@/components/biz/PipelineFloatingDock";

export const ChatSection = () => {
  return (
    <section id="chat" className="py-24 pb-32 relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-32">
          <h2
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-emerald-400 mb-6 animate-fade-in-scale opacity-0"
            style={{ animationDelay: "0.6s" }}
          >
            开始体验
          </h2>
        </div>

        <div className="animate-fade-in-scale opacity-0 relative" style={{ animationDelay: "1s" }}>
          <div className="relative z-10">
            <PipelineFloatingDock
              pipelineId="business-code-generate"
              placeholder="例如：创建一个用户登录表单，包含邮箱、密码输入框和记住我选项..."
              className="!static !bottom-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
