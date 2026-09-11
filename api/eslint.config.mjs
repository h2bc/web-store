import stylistic from "@stylistic/eslint-plugin";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

const paddingLines = [
  "error",
  { blankLine: "always", prev: "*", next: "return" },
  { blankLine: "always", prev: ["const", "let"], next: "*" },
  { blankLine: "any", prev: ["const", "let"], next: ["const", "let"] },
  { blankLine: "always", prev: "multiline-block-like", next: "*" },
  { blankLine: "always", prev: "*", next: "multiline-block-like" },
];

export default [
  { ignores: [".medusa/", "node_modules/", "static/"] },
  ...tsPlugin.configs["flat/recommended"].map((c) => ({
    ...c,
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { ...c.languageOptions, parser: tsParser },
  })),
  {
    plugins: { "@stylistic": stylistic },
    rules: { "@stylistic/padding-line-between-statements": paddingLines },
  },
  prettier,
];
