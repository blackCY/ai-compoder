/**
 * 通用深度合并工具
 * 纯工具函数，不带业务语义
 */

/**
 * 深度合并两个数据
 * - 对象：递归合并，新值覆盖旧值
 * - 数组：递归合并元素（按索引）
 * - 基本类型：新值覆盖旧值
 *
 * @param oldData - 旧数据
 * @param newData - 新数据
 * @returns 合并后的数据
 *
 * @example
 * mergeData({ a: 1, b: 2 }, { b: 3, c: 4 }) // { a: 1, b: 3, c: 4 }
 * mergeData([1, 2], [3]) // [3, 2]
 * mergeData({ arr: [1, 2] }, { arr: [3] }) // { arr: [3, 2] }
 */
export function mergeData<T = unknown>(oldData: T, newData: T): T {
  // 新数据为空，返回旧数据
  if (newData === null || newData === undefined) {
    return oldData;
  }

  // 旧数据为空或非对象，直接返回新数据
  if (oldData === null || oldData === undefined || typeof oldData !== "object") {
    return newData;
  }

  // 新数据非对象，直接返回新数据
  if (typeof newData !== "object") {
    return newData;
  }

  // 数组：按索引递归合并
  if (Array.isArray(newData)) {
    if (!Array.isArray(oldData)) {
      return newData;
    }

    const result = [...oldData];
    for (let i = 0; i < newData.length; i++) {
      result[i] = mergeData(oldData[i], newData[i]);
    }
    return result as T;
  }

  // 对象：递归合并
  const result = { ...oldData } as Record<string, unknown>;
  const newObj = newData as Record<string, unknown>;

  for (const key of Object.keys(newObj)) {
    result[key] = mergeData(result[key], newObj[key]);
  }

  return result as T;
}
