import type { ComponentType } from 'react';

/**
 * 文件映射表
 * key: 文件路径 (如 'App.tsx', 'utils/helper.ts')
 * value: 文件代码字符串
 */
export type FileMap = Record<string, string>;

/**
 * 模块缓存项
 */
export interface ModuleCacheItem {
  exports: Record<string, unknown>;
  compiled: boolean;
}

/**
 * 模块缓存
 */
export type ModuleCache = Record<string, ModuleCacheItem>;

/**
 * 编译回调
 */
export interface CompileCallbacks {
  /**
   * 编译失败时的回调
   */
  onError?: (error: Error) => void;

  /**
   * 编译成功时的回调
   */
  onSuccess?: (component: ComponentType) => void;
}

/**
 * 单文件编译选项
 */
export interface CompileOptions {
  /**
   * 要编译的代码字符串
   */
  code: string;

  /**
   * 注入到代码执行作用域的依赖
   * 例如: { React, ReactDOM, lodash }
   */
  dependencies?: Record<string, unknown>;

  /**
   * 额外的 Babel 插件
   */
  plugins?: string[];

  /**
   * 预设的 Babel 配置
   */
  presets?: string[];
}

/**
 * 多文件编译选项
 */
export interface MultiFileCompileOptions {
  /**
   * 文件映射表
   */
  fileMap: FileMap;

  /**
   * 入口文件路径
   * @default 'App.tsx'
   */
  entryFile?: string;

  /**
   * 注入到代码执行作用域的依赖
   */
  dependencies?: Record<string, unknown>;
}

/**
 * 编译结果
 */
export interface CompileResult {
  /**
   * 编译后的组件
   */
  Component: ComponentType;

  /**
   * 编译过程中的错误
   */
  error?: Error;
}

/**
 * 渲染器 Props
 */
export interface CodeRendererProps {
  /**
   * 要渲染的代码字符串（单文件模式）
   * 支持 JSX/TSX 语法
   * 与 fileMap 互斥，fileMap 优先
   */
  code?: string;

  /**
   * 多文件模式：文件映射表
   * 与 code 互斥，优先使用 fileMap
   */
  fileMap?: FileMap;

  /**
   * 多文件模式：入口文件
   * @default 'App.tsx'
   */
  entryFile?: string;

  /**
   * 注入到代码执行作用域的依赖
   * 必须包含 React 和 ReactDOM
   */
  dependencies?: Record<string, unknown>;

  /**
   * 编译失败时的回调
   */
  onError?: (error: Error) => void;

  /**
   * 编译成功时的回调
   */
  onSuccess?: (component: ComponentType) => void;

  /**
   * 自定义 className
   */
  className?: string;

  /**
   * 自定义运行时错误渲染函数
   * @param error - 错误对象
   * @returns 自定义的错误 UI
   */
  renderError?: (error: Error) => React.ReactNode;

  /**
   * 容器最大高度（用于触发滚动）
   * @default undefined
   * @example "500px" 或 "100vh" 或 "100%"
   */
  maxHeight?: string;

  /**
   * 是否启用全屏按钮
   * @default true
   */
  enableFullscreen?: boolean;

  /**
   * 全屏状态变化回调
   */
  onFullscreenChange?: (isFullscreen: boolean) => void;
}
