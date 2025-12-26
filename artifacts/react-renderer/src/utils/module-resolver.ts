import type { FileMap } from '../types';

/**
 * 支持的文件扩展名，按优先级排序
 */
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'] as const;

/**
 * 规范化路径，移除 ./ 前缀，处理 ../ 等
 */
function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const result: string[] = [];

  for (const part of parts) {
    if (part === '..') {
      result.pop();
    } else if (part !== '.') {
      result.push(part);
    }
  }

  return result.join('/');
}

/**
 * 获取文件所在目录
 */
function getDirectory(filePath: string): string {
  const parts = filePath.split('/');
  parts.pop();
  return parts.join('/');
}

/**
 * 解析相对路径为绝对路径
 * @param currentFile 当前文件路径
 * @param importPath 导入路径
 * @param fileMap 文件映射表
 * @returns 解析后的文件路径，如果找不到返回 null
 */
export function resolvePath(
  currentFile: string,
  importPath: string,
  fileMap: FileMap
): string | null {
  // 非相对路径（外部依赖）
  if (!importPath.startsWith('.')) {
    return null;
  }

  const currentDir = getDirectory(currentFile);
  const basePath = normalizePath(
    currentDir ? `${currentDir}/${importPath}` : importPath
  );

  // 1. 精确匹配（已有扩展名）
  if (fileMap[basePath]) {
    return basePath;
  }

  // 2. 尝试添加扩展名
  for (const ext of EXTENSIONS) {
    const pathWithExt = `${basePath}${ext}`;
    if (fileMap[pathWithExt]) {
      return pathWithExt;
    }
  }

  // 3. 尝试作为目录，查找 index 文件
  for (const ext of EXTENSIONS) {
    const indexPath = `${basePath}/index${ext}`;
    if (fileMap[indexPath]) {
      return indexPath;
    }
  }

  return null;
}

/**
 * 检测循环依赖
 */
export function detectCircularDependency(
  filePath: string,
  executionStack: string[]
): boolean {
  return executionStack.includes(filePath);
}

/**
 * 格式化循环依赖错误信息
 */
export function formatCircularError(
  filePath: string,
  executionStack: string[]
): string {
  const cycle = [...executionStack, filePath];
  const startIndex = cycle.indexOf(filePath);
  const cyclePath = cycle.slice(startIndex).join(' → ');
  return `Circular dependency detected: ${cyclePath}`;
}
