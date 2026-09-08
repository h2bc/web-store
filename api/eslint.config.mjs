import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
  { ignores: [".medusa/", "node_modules/", "static/"] },
  ...tsPlugin.configs["flat/recommended"].map((c) => ({
    ...c,
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { ...c.languageOptions, parser: tsParser },
  })),
  prettier,
];
