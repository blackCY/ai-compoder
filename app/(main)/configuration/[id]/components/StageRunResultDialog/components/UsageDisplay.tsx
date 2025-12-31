"use client";

import { LanguageModelUsage } from "ai";
import { Coins, Zap, Activity } from "lucide-react";

export interface UsageDisplayProps {
  usage: LanguageModelUsage | null;
}

function UsageToken({ label, value, color, icon: Icon }: {
  label: string;
  value: number;
  color: "cyan" | "purple" | "emerald";
  icon: any;
}) {
  const colorClasses = {
    cyan: {
      bg: "bg-cyan-500/5",
      border: "border-cyan-500/20",
      icon: "text-cyan-400",
      label: "text-cyan-300/60",
      value: "text-cyan-400",
      glow: "shadow-cyan-500/20"
    },
    purple: {
      bg: "bg-purple-500/5",
      border: "border-purple-500/20",
      icon: "text-purple-400",
      label: "text-purple-300/60",
      value: "text-purple-400",
      glow: "shadow-purple-500/20"
    },
    emerald: {
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      icon: "text-emerald-400",
      label: "text-emerald-300/60",
      value: "text-emerald-400",
      glow: "shadow-emerald-500/20"
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg",
      "border shadow-sm",
      classes.bg, classes.border, classes.glow
    )}>
      <Icon className={cn("h-3.5 w-3.5", classes.icon)} />
      <span className={cn("text-[10px] font-bold uppercase tracking-wider font-mono", classes.label)}>
        {label}
      </span>
      <span className={cn("text-xs font-bold font-mono", classes.value)}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function UsageDisplay({ usage }: UsageDisplayProps) {
  if (!usage) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-700">
        <Activity className="h-3.5 w-3.5 opacity-50" />
        <span className="font-mono">No usage data</span>
      </div>
    );
  }

  const totalTokens = usage.totalTokens ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);

  return (
    <div className="flex items-center gap-3">
      <UsageToken
        label="IN"
        value={usage.inputTokens || 0}
        color="cyan"
        icon={Zap}
      />
      <div className="w-px h-4 bg-gray-800" />
      <UsageToken
        label="OUT"
        value={usage.outputTokens || 0}
        color="purple"
        icon={Zap}
      />
      <div className="w-px h-4 bg-gray-800" />
      <UsageToken
        label="TOTAL"
        value={totalTokens}
        color="emerald"
        icon={Coins}
      />
    </div>
  );
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
