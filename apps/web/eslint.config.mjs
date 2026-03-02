// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rules
  {
    rules: {
      // 允许在 effect 中同步调用 setState（某些场景下是合理的）
      "react-hooks/set-state-in-effect": "off",
      // 允许在渲染期间访问 ref（用于回调 ref 模式）
      "react-hooks/refs": "off",
      // 允许以 _ 开头的未使用变量（用于占位符参数）
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  // 忽略 dist 目录和编译产物
  {
    ignores: ["**/dist/**", "../../packages/**/dist/**", "public/monaco/**"],
  },
]);

export default eslintConfig;
