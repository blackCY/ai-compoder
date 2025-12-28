import { describe, it, expect } from "vitest";
import { objectToMarkdown } from "../objectToMarkdown";

describe("objectToMarkdown", () => {
  describe("基础类型", () => {
    it("应该处理 null", () => {
      expect(objectToMarkdown(null)).toBe("");
    });

    it("应该处理 undefined", () => {
      expect(objectToMarkdown(undefined)).toBe("");
    });

    it("应该处理字符串", () => {
      expect(objectToMarkdown("hello")).toBe("hello");
    });

    it("应该处理数字", () => {
      expect(objectToMarkdown(123)).toBe("123");
    });

    it("应该处理布尔值", () => {
      expect(objectToMarkdown(true)).toBe("true");
      expect(objectToMarkdown(false)).toBe("false");
    });
  });

  describe("对象转换", () => {
    it("应该将简单对象转换为二级标题", () => {
      const result = objectToMarkdown({ title: "Hello", content: "World" });
      expect(result).toContain("## title");
      expect(result).toContain("Hello");
      expect(result).toContain("## content");
      expect(result).toContain("World");
    });

    it("应该处理嵌套对象，层级递增", () => {
      const result = objectToMarkdown({
        section: {
          subsection: "value",
        },
      });
      expect(result).toContain("## section");
      expect(result).toContain("### subsection");
      expect(result).toContain("value");
    });

    it("应该处理深层嵌套，最多到6级标题", () => {
      const result = objectToMarkdown({
        l1: {
          l2: {
            l3: {
              l4: {
                l5: {
                  l6: "deep value",
                },
              },
            },
          },
        },
      });
      expect(result).toContain("## l1");
      expect(result).toContain("### l2");
      expect(result).toContain("#### l3");
      expect(result).toContain("##### l4");
      expect(result).toContain("###### l5");
      expect(result).toContain("###### l6"); // 最多6级
      expect(result).toContain("deep value");
    });

    it("应该跳过 null 和 undefined 值", () => {
      const result = objectToMarkdown({
        valid: "value",
        nullField: null,
        undefinedField: undefined,
      });
      expect(result).toContain("## valid");
      expect(result).not.toContain("nullField");
      expect(result).not.toContain("undefinedField");
    });
  });

  describe("数组转换", () => {
    it("应该将对象数组转换为独立的 markdown 块", () => {
      const result = objectToMarkdown([{ name: "A" }, { name: "B" }]);
      expect(result).toContain("## name");
      expect(result).toContain("A");
      expect(result).toContain("B");
      expect(result).toContain("---"); // 分隔线
    });

    it("应该处理基础类型数组", () => {
      const result = objectToMarkdown(["item1", "item2", "item3"]);
      expect(result).toContain("item1");
      expect(result).toContain("item2");
      expect(result).toContain("item3");
    });

    it("应该处理对象内的数组", () => {
      const result = objectToMarkdown({
        items: ["a", "b", "c"],
      });
      expect(result).toContain("## items");
      expect(result).toContain("- a");
      expect(result).toContain("- b");
      expect(result).toContain("- c");
    });
  });

  describe("复杂结构", () => {
    it("应该处理混合结构", () => {
      const result = objectToMarkdown({
        title: "文档标题",
        metadata: {
          author: "张三",
          date: "2024-01-01",
        },
        sections: [
          { heading: "第一节", content: "内容1" },
          { heading: "第二节", content: "内容2" },
        ],
      });
      expect(result).toContain("## title");
      expect(result).toContain("文档标题");
      expect(result).toContain("## metadata");
      expect(result).toContain("### author");
      expect(result).toContain("张三");
      expect(result).toContain("## sections");
    });
  });
});
