import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import type { FC } from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/utils";
import type { CodeRendererProps } from "../types";
import { compileCode, compileMultiFile } from "../utils/compiler";
import { ErrorBoundary } from "./ErrorBoundary";
import { FullscreenButton } from "./FullscreenButton";

/**
 * 代码渲染器组件
 * 接收字符串代码，动态编译并渲染
 * 支持单文件模式和多文件模式
 */
export const CodeRenderer: FC<CodeRendererProps> = ({
  code,
  fileMap,
  entryFile = "App.tsx",
  dependencies = {},
  onError,
  onSuccess,
  className,
  renderError,
  maxHeight,
  enableFullscreen = true,
  onFullscreenChange,
}) => {
  // 全屏状态 + 占位符位置追踪
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const placeholderRef = useRef<HTMLDivElement>(null);

  // 追踪占位符位置（非全屏时用于定位 Portal 内容）
  useEffect(() => {
    if (isFullscreen) return; // 全屏时不需要追踪位置

    const updatePosition = () => {
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updatePosition();

    // 监听窗口大小变化和滚动，更新位置
    const resizeObserver = new ResizeObserver(updatePosition);
    if (placeholderRef.current) {
      resizeObserver.observe(placeholderRef.current);
    }

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const next = !prev;
      onFullscreenChange?.(next);
      return next;
    });
  }, [onFullscreenChange]);

  // ESC 键退出全屏
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
        onFullscreenChange?.(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, onFullscreenChange]);

  // 用 ref 保存回调，避免触发重编译
  const callbacksRef = useRef<Partial<CodeRendererProps>>({});
  callbacksRef.current = { onError, onSuccess };

  // 编译代码，生成组件
  const { Component, error } = useMemo(() => {
    const { onError, onSuccess } = callbacksRef.current || {};

    const callbacks = {
      onError,
      onSuccess,
    };

    // 多文件模式优先
    if (fileMap && Object.keys(fileMap).length > 0) {
      return compileMultiFile({ fileMap, entryFile, dependencies }, callbacks);
    }

    // 单文件模式
    if (code) {
      return compileCode({ code, dependencies }, callbacks);
    }

    const err = new Error("No code or fileMap provided");
    onError?.(err);

    return {
      Component: () => null,
      error: err,
    };
  }, [code, fileMap, entryFile, dependencies]);

  // 渲染内容（组件或错误）
  const content = useMemo(() => (
    <>
      {enableFullscreen && (
        <div className="absolute top-2 right-2 z-10">
          <FullscreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
        </div>
      )}
      {error ? (
        <div
          className={cn(
            "react-renderer-error",
            "p-4 bg-red-500/10 border border-red-500/30 rounded-lg",
            "text-red-400 text-sm font-mono"
          )}
        >
          <div className="font-semibold mb-2">Compilation Error</div>
          <pre className="whitespace-pre-wrap select-text">
            {typeof error.message === "string"
              ? error.message
              : String(error.message || "Unknown error")}
          </pre>
        </div>
      ) : (
        <ErrorBoundary className="h-full" onError={onError} renderError={renderError}>
          <Component />
        </ErrorBoundary>
      )}
    </>
  ), [error, isFullscreen, toggleFullscreen, enableFullscreen, onError, renderError, Component]);

  // 始终使用 Portal 渲染到 body，通过样式控制全屏/非全屏
  // 这样组件不会卸载/重新挂载，保持状态
  const portalStyle: React.CSSProperties = isFullscreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: "white",
      }
    : {
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
        maxHeight: maxHeight || undefined,
      };

  // 返回占位符 + Portal
  return (
    <>
      {/* 占位符：在原位置占据空间 */}
      <div ref={placeholderRef} className={cn("w-full h-full", className)} />
      {/* Portal：始终渲染到 body，通过样式控制位置 */}
      {createPortal(
        <div className={cn("react-renderer relative overflow-auto")} style={portalStyle}>
          {content}
        </div>,
        document.body
      )}
    </>
  );
};
