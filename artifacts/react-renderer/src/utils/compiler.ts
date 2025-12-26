// @ts-expect-error - @babel/standalone has no type definitions
import Babel from '@babel/standalone';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import type { ComponentType } from 'react';
import type {
  CompileOptions,
  CompileResult,
  CompileCallbacks,
  MultiFileCompileOptions,
  ModuleCache,
  FileMap,
} from '../types';
import {
  resolvePath,
  detectCircularDependency,
  formatCircularError,
} from './module-resolver';

/**
 * 预设的 Babel 配置
 * - react preset 使用 automatic runtime，无需显式 import React
 * - typescript preset 配置 isTSX 和 allExtensions 以支持 .ts 文件中的 JSX
 */
const DEFAULT_PRESETS = [
  ['react', { runtime: 'automatic' }],
  'env',
  ['typescript', { isTSX: true, allExtensions: true }],
] as const;

/**
 * 内置依赖
 * 包含 react/jsx-runtime 以支持 automatic JSX runtime
 */
const BUILTIN_DEPENDENCIES: Record<string, unknown> = {
  react: React,
  'react-dom': ReactDOM,
  'react/jsx-runtime': require('react/jsx-runtime'),
  'react/jsx-dev-runtime': require('react/jsx-dev-runtime'),
};

/**
 * CSS 文件扩展名
 */
const CSS_EXTENSIONS = ['.css', '.scss', '.sass', '.less'] as const;

/**
 * 判断是否为 CSS 文件
 */
function isCssFile(filePath: string): boolean {
  return CSS_EXTENSIONS.some(ext => filePath.endsWith(ext));
}

/**
 * 注入 CSS 到页面
 * 使用唯一 ID 避免重复注入
 */
function injectCss(css: string, id: string): void {
  if (typeof document === 'undefined') return;

  const styleId = `react-renderer-style-${id.replace(/[^a-zA-Z0-9]/g, '-')}`;
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = css;
}

/**
 * 转译代码
 */
function transformCode(code: string, filename: string): string {
  const result = Babel.transform(code, {
    presets: [...DEFAULT_PRESETS],
    filename,
    plugins: ['transform-modules-commonjs'],
    code: true,
  });

  if (!result.code) {
    throw new Error(`Failed to transform: ${filename}`);
  }

  return result.code;
}

/**
 * 执行单个模块
 */
function executeModule(
  filePath: string,
  fileMap: FileMap,
  moduleCache: ModuleCache,
  dependencies: Record<string, unknown>,
  executionStack: string[]
): void {
  // 检测循环依赖
  if (detectCircularDependency(filePath, executionStack)) {
    throw new Error(formatCircularError(filePath, executionStack));
  }

  // 已编译则跳过
  if (moduleCache[filePath]?.compiled) {
    return;
  }

  const code = fileMap[filePath];
  if (!code) {
    throw new Error(`Module not found: ${filePath}`);
  }

  // CSS 文件特殊处理：注入样式并返回空模块
  if (isCssFile(filePath)) {
    injectCss(code, filePath);
    moduleCache[filePath] = {
      exports: {},
      compiled: true,
    };
    return;
  }

  // 转译代码
  const transformed = transformCode(code, filePath);

  // 初始化模块缓存
  moduleCache[filePath] = {
    exports: {},
    compiled: false,
  };

  // 合并内置依赖和外部依赖
  const allDependencies = { ...BUILTIN_DEPENDENCIES, ...dependencies };

  // 创建当前模块的 require 函数
  const moduleRequire = (importPath: string): unknown => {
    // 外部依赖
    if (!importPath.startsWith('.')) {
      if (allDependencies[importPath]) {
        return allDependencies[importPath];
      }
      throw new Error(
        `External dependency "${importPath}" not found in dependencies`
      );
    }

    // 内部模块
    const resolved = resolvePath(filePath, importPath, fileMap);
    if (!resolved) {
      throw new Error(
        `Module not found: ${importPath} (from ${filePath})`
      );
    }

    // 递归编译依赖
    executeModule(
      resolved,
      fileMap,
      moduleCache,
      dependencies,
      [...executionStack, filePath]
    );

    return moduleCache[resolved].exports;
  };

  // 准备执行环境 - 只传基础参数，依赖通过 require 访问
  const moduleExports = moduleCache[filePath].exports;

  // 执行代码
  const executeCode = new Function(
    'require',
    'module',
    'exports',
    'window',
    'document',
    transformed
  );
  executeCode(
    moduleRequire,
    { exports: moduleExports },
    moduleExports,
    typeof window !== 'undefined' ? window : {},
    typeof document !== 'undefined' ? document : {}
  );

  // 标记为已编译
  moduleCache[filePath].compiled = true;
}

/**
 * 将字符串代码编译为 React 组件（单文件模式）
 */
export function compileCode(
  options: CompileOptions,
  callbacks?: CompileCallbacks
): CompileResult {
  const { code, dependencies = {} } = options;
  const { onError, onSuccess } = callbacks ?? {};

  try {
    // 合并内置依赖和外部依赖
    const allDependencies = { ...BUILTIN_DEPENDENCIES, ...dependencies };

    // 1. 转译代码 (JSX/TSX → JS)
    const transformed = transformCode(code, 'component.tsx');

    // 2. 创建模块导出对象
    const moduleExports: Record<string, unknown> = {};

    // 3. 创建 require 函数
    const moduleRequire = (importPath: string): unknown => {
      if (allDependencies[importPath]) {
        return allDependencies[importPath];
      }
      throw new Error(
        `External dependency "${importPath}" not found in dependencies`
      );
    };

    // 4. 执行转译后的代码 - 只传基础参数，依赖通过 require 访问
    const executeCode = new Function(
      'require',
      'module',
      'exports',
      'window',
      'document',
      transformed
    );
    executeCode(
      moduleRequire,
      { exports: moduleExports },
      moduleExports,
      typeof window !== 'undefined' ? window : {},
      typeof document !== 'undefined' ? document : {}
    );

    // 5. 提取默认导出的组件
    const Component = moduleExports.default;

    if (!Component) {
      throw new Error('Code must have a default export');
    }

    const result = { Component: Component as ComponentType };
    onSuccess?.(result.Component);
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    return {
      Component: () => null,
      error: err,
    };
  }
}

/**
 * 多文件编译为 React 组件
 */
export function compileMultiFile(
  options: MultiFileCompileOptions,
  callbacks?: CompileCallbacks
): CompileResult {
  const {
    fileMap,
    entryFile = 'App.tsx',
    dependencies = {},
  } = options;
  const { onError, onSuccess } = callbacks ?? {};

  try {
    // 验证入口文件存在
    if (!fileMap[entryFile]) {
      throw new Error(`Entry file not found: ${entryFile}`);
    }

    // 初始化模块缓存
    const moduleCache: ModuleCache = {};

    // 从入口文件开始执行
    executeModule(entryFile, fileMap, moduleCache, dependencies, []);

    // 提取默认导出
    const Component = moduleCache[entryFile].exports.default;

    if (!Component) {
      throw new Error(`Entry file "${entryFile}" must have a default export`);
    }

    const result = { Component: Component as ComponentType };
    onSuccess?.(result.Component);
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    return {
      Component: () => null,
      error: err,
    };
  }
}
