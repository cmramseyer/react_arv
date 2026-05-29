import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import tanstackQueryPlugin from "@tanstack/eslint-plugin-query";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: {
      "@tanstack/query": tanstackQueryPlugin,
    },
    rules: {
      ...tanstackQueryPlugin.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.{test,spec}.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]);
