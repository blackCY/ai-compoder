import type { Preview } from "@storybook/nextjs-vite";
import "../app/globals.css";

// @ai-sdk/react 包依赖于 Node.js 环境的 __dirname 变量，但在Storybook 的浏览器环境中这个变量未定义，因此这里设置一个假值
if (typeof global !== "undefined" && typeof global.__dirname === "undefined") {
  global.__dirname = "/mock/dir";
}

if (typeof window !== "undefined" && typeof window.__dirname === "undefined") {
  (window as any).__dirname = "/mock/dir";
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    // Add dark mode support
    docs: {
      toc: true,
    },
    // Set dark theme as default
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#0a0a0a",
        },
        {
          name: "light",
          value: "#ffffff",
        },
      ],
    },
  },

  // Set dark mode for all stories
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "dark",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
