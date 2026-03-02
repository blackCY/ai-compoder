import type { FC, MouseEvent } from "react";
import { cn } from "../utils/utils";

export interface FullscreenButtonProps {
  /**
   * 当前是否全屏
   */
  isFullscreen: boolean;
  /**
   * 点击回调
   */
  onClick: () => void;
  /**
   * 自定义 className
   */
  className?: string;
}

/**
 * 全屏切换按钮
 * 使用内联 SVG 图标，避免额外依赖
 */
export const FullscreenButton: FC<FullscreenButtonProps> = ({
  isFullscreen,
  onClick,
  className,
}) => {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "p-1.5 rounded-md transition-all duration-200",
        "bg-black/40 hover:bg-black/60 backdrop-blur-sm",
        "text-white/70 hover:text-white",
        "border border-white/10 hover:border-white/20",
        "focus:outline-none focus:ring-2 focus:ring-white/30",
        className
      )}
      title={isFullscreen ? "退出全屏 (ESC)" : "全屏显示"}
      aria-label={isFullscreen ? "退出全屏" : "全屏显示"}
    >
      {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
    </button>
  );
};

/**
 * 最大化图标 (进入全屏)
 */
const MaximizeIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

/**
 * 最小化图标 (退出全屏)
 */
const MinimizeIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 14h6v6" />
    <path d="M20 10h-6V4" />
    <path d="M14 10l7-7" />
    <path d="M3 21l7-7" />
  </svg>
);
