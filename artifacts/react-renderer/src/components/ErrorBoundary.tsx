import { Component, type ReactNode, type ErrorInfo } from "react";
import { cn } from "../utils/utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  className?: string;
  onError?: (error: Error) => void;
  renderError?: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * 错误边界组件
 * 捕获子组件渲染时的运行时错误
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("CodeRenderer runtime error:", error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) {
      // 优先使用自定义错误渲染
      if (this.props.renderError) {
        return this.props.renderError(this.state.error);
      }

      // 默认错误 UI
      return (
        <div
          className={cn(
            "react-renderer-error",
            "p-4 bg-red-500/10 border border-red-500/30 rounded-lg",
            "text-red-400 text-sm font-mono",
            this.props.className
          )}
        >
          <div className="font-semibold mb-2">Runtime Error</div>
          <pre className="whitespace-pre-wrap">{this.state.error.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
