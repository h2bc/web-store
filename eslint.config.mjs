import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

const paddingLines = [
  "error",
  { blankLine: "always", prev: "*", next: "return" },
  { blankLine: "always", prev: ["const", "let"], next: "*" },
  { blankLine: "any", prev: ["const", "let"], next: ["const", "let"] },
  { blankLine: "always", prev: "multiline-block-like", next: "*" },
  { blankLine: "always", prev: "*", next: "multiline-block-like" },
];

export default tseslint.config(
  { files: ["e2e/**/*.ts", "playwright.config.ts"] },
  { ignores: ["api/", "front/", "node_modules/", "test-results/", "playwright-report/"] },
  ...tseslint.configs.recommended,
  {
    plugins: { "@stylistic": stylistic },
    rules: { "@stylistic/padding-line-between-statements": paddingLines },
  },
);
