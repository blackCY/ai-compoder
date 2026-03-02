/**
 * 通用深度合并工具测试
 * 验证 mergeData 函数的深度合并行为
 */

import { describe, it, expect } from "vitest";
import { mergeData } from "../mergeData";

describe("mergeData - 通用深度合并", () => {
  describe("边界情况", () => {
    it("新数据为 null 时，返回旧数据", () => {
      const oldData = { a: 1, b: 2 };
      const result = mergeData(oldData, null as unknown as typeof oldData);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("新数据为 undefined 时，返回旧数据", () => {
      const oldData = { a: 1, b: 2 };
      const result = mergeData(oldData, undefined as unknown as typeof oldData);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("旧数据为 null 时，返回新数据", () => {
      const newData = { a: 1, b: 2 };
      const result = mergeData(null as unknown as typeof newData, newData);
      expect(result).toEqual(newData);
    });

    it("旧数据为 undefined 时，返回新数据", () => {
      const newData = { a: 1, b: 2 };
      const result = mergeData(undefined as unknown as typeof newData, newData);
      expect(result).toEqual(newData);
    });

    it("新数据不是对象时，返回新数据", () => {
      const oldData = { a: 1 };
      const result = mergeData(oldData as unknown, "string value" as unknown);
      expect(result).toBe("string value");
    });

    it("旧数据不是对象时，返回新数据", () => {
      const newData = { a: 1, b: 2 };
      const result = mergeData("string value" as unknown, newData as unknown);
      expect(result).toEqual(newData);
    });
  });

  describe("对象合并", () => {
    it("应该合并两个对象，新值覆盖旧值", () => {
      const oldData = { a: 1, b: 2 };
      const newData = { b: 3, c: 4 };
      const result = mergeData(oldData as Record<string, number>, newData as Record<string, number>);
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it("应该保留旧对象中未被覆盖的属性", () => {
      const oldData = { a: 1, b: 2, c: 3 };
      const newData = { b: 20 };
      const result = mergeData(oldData as Record<string, number>, newData as Record<string, number>);
      expect(result).toEqual({ a: 1, b: 20, c: 3 });
    });

    it("应该添加新对象中的新属性", () => {
      const oldData = { a: 1 };
      const newData = { b: 2, c: 3 };
      const result = mergeData(oldData as Record<string, number>, newData as Record<string, number>);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("应该递归合并嵌套对象", () => {
      const oldData = { a: 1, nested: { x: 1, y: 2 } };
      const newData = { nested: { y: 20, z: 30 } };
      const result = mergeData(oldData as Record<string, unknown>, newData as Record<string, unknown>);
      expect(result).toEqual({ a: 1, nested: { x: 1, y: 20, z: 30 } });
    });

    it("应该递归合并多层嵌套对象", () => {
      const oldData = { level1: { level2: { a: 1, b: 2 } } };
      const newData = { level1: { level2: { b: 20, c: 30 } } };
      const result = mergeData(oldData as Record<string, unknown>, newData as Record<string, unknown>);
      expect(result).toEqual({ level1: { level2: { a: 1, b: 20, c: 30 } } });
    });
  });

  describe("数组合并（按索引）", () => {
    it("应该按索引合并数组", () => {
      const oldData = [1, 2, 3];
      const newData = [10];
      const result = mergeData(oldData, newData);
      expect(result).toEqual([10, 2, 3]);
    });

    it("新数组更长时，应该扩展结果", () => {
      const oldData = [1, 2];
      const newData = [10, 20, 30];
      const result = mergeData(oldData, newData);
      expect(result).toEqual([10, 20, 30]);
    });

    it("应该递归合并数组中的对象", () => {
      const oldData = [{ a: 1, b: 2 }, { c: 3 }] as unknown[];
      const newData = [{ b: 20 }] as unknown[];
      const result = mergeData(oldData, newData);
      expect(result).toEqual([{ a: 1, b: 20 }, { c: 3 }]);
    });

    it("旧数据不是数组时，返回新数组", () => {
      const oldData = { a: 1 };
      const newData = [1, 2, 3];
      const result = mergeData(oldData as unknown, newData as unknown);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe("对象中的数组属性", () => {
    it("应该按索引合并对象中的数组", () => {
      const oldData = { files: [1, 2, 3] };
      const newData = { files: [10] };
      const result = mergeData(oldData, newData);
      expect(result).toEqual({ files: [10, 2, 3] });
    });

    it("应该递归合并对象数组中的元素", () => {
      const oldData = {
        files: [
          { fileName: "a.tsx", content: "old a" },
          { fileName: "b.tsx", content: "old b" },
        ],
      };
      const newData = {
        files: [{ fileName: "a.tsx", content: "new a" }],
      };
      const result = mergeData(oldData, newData);
      expect(result).toEqual({
        files: [
          { fileName: "a.tsx", content: "new a" },
          { fileName: "b.tsx", content: "old b" },
        ],
      });
    });
  });

  describe("多轮对话场景", () => {
    it("第一轮 - 旧数据为空，返回新数据", () => {
      const oldData = undefined;
      const newData = {
        files: [
          { fileName: "App.tsx", content: "app content" },
          { fileName: "Button.tsx", content: "button content" },
        ],
      };
      const result = mergeData(oldData as unknown as typeof newData, newData);
      expect(result).toEqual(newData);
    });

    it("第二轮 - 修改第一个文件，保留其他文件", () => {
      const oldData = {
        files: [
          { fileName: "App.tsx", content: "old app", description: "App" },
          { fileName: "Button.tsx", content: "old button", description: "Button" },
        ],
        metadata: { version: "1.0" },
      };
      const newData = {
        files: [{ fileName: "App.tsx", content: "new app" }],
      };
      const result = mergeData(oldData, newData);
      expect(result).toEqual({
        files: [
          { fileName: "App.tsx", content: "new app", description: "App" },
          { fileName: "Button.tsx", content: "old button", description: "Button" },
        ],
        metadata: { version: "1.0" },
      });
    });

    it("第三轮 - 修改第二个文件", () => {
      const oldData = {
        files: [
          { fileName: "App.tsx", content: "new app" },
          { fileName: "Button.tsx", content: "old button" },
        ],
      };
      const newData = {
        files: [
          undefined as unknown as { fileName: string; content: string },
          { fileName: "Button.tsx", content: "new button" },
        ],
      };
      const result = mergeData(oldData, newData);
      expect(result).toEqual({
        files: [
          { fileName: "App.tsx", content: "new app" },
          { fileName: "Button.tsx", content: "new button" },
        ],
      });
    });
  });
});
