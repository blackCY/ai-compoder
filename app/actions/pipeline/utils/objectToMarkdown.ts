/**
 * 将对象或数组转换为 Markdown 格式
 * - 对象：第一层属性作为二级标题，依次递增
 * - 数组：每个元素作为独立的二级标题开头的 markdown 块
 */

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyJson = any;

/**
 * 将值转换为 markdown 内容
 * @param value 任意 JSON 值
 * @param level 当前标题层级（从 2 开始）
 */
function valueToMarkdown(value: JsonValue, level: number): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          return objectToMarkdownWithLevel(item as JsonObject, level);
        }
        return `- ${valueToMarkdown(item, level + 1)}`;
      })
      .join("\n\n");
  }

  // 对象
  return objectToMarkdownWithLevel(value as JsonObject, level);
}

/**
 * 将对象转换为指定层级的 markdown
 */
function objectToMarkdownWithLevel(obj: JsonObject, level: number): string {
  const lines: string[] = [];
  const headingPrefix = "#".repeat(Math.min(level, 6)); // markdown 最多支持 6 级标题

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "object") {
      // 对象或数组：添加标题，递归处理
      lines.push(`${headingPrefix} ${key}`);
      lines.push(valueToMarkdown(value, level + 1));
    } else {
      // 基础类型：标题 + 内容
      lines.push(`${headingPrefix} ${key}`);
      lines.push(String(value));
    }
  }

  return lines.join("\n\n");
}

/**
 * 将 JSON 对象或数组转换为 Markdown 格式
 * @param data 要转换的数据（对象或数组）
 * @returns Markdown 格式的字符串
 *
 * @example
 * // 对象示例
 * objectToMarkdown({ title: "Hello", content: "World" })
 * // 输出:
 * // ## title
 * // Hello
 * //
 * // ## content
 * // World
 *
 * @example
 * // 数组示例
 * objectToMarkdown([{ name: "A" }, { name: "B" }])
 * // 输出:
 * // ## name
 * // A
 * //
 * // ## name
 * // B
 */
export function objectToMarkdown(data: AnyJson): string {
  if (data === null || data === undefined) {
    return "";
  }

  if (typeof data !== "object") {
    return String(data);
  }

  if (Array.isArray(data)) {
    // 数组：每个元素作为独立的二级标题块
    return data
      .map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          return objectToMarkdownWithLevel(item as JsonObject, 2);
        }
        return valueToMarkdown(item, 2);
      })
      .join("\n\n---\n\n"); // 用分隔线区分数组元素
  }

  // 对象：从二级标题开始
  return objectToMarkdownWithLevel(data as JsonObject, 2);
}
