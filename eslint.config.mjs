import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals"),
  eslintPluginUnicorn.configs["recommended"],
  {
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "unicorn/better-regex": "warn",
      "unicorn/filename-case": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/switch-case-braces": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-static-only-class": "off",
      "unicorn/prefer-add-event-listener": "off",
      "unicorn/prefer-response-static-json": "off",
      "unicorn/catch-error-name": "off",
      "unicorn/prefer-number-properties": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/no-instanceof-builtins": "off",
      "unicorn/no-negated-condition": "off",
      "unicorn/prefer-optional-catch-binding": "off",
      "unicorn/explicit-length-check": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/prefer-node-protocol": "off",
      "unicorn/prefer-module": "off",
      "unicorn/text-encoding-identifier-case": "off",
      "unicorn/no-process-exit": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/prefer-at": "off",
      "unicorn/better-regex": "off",
      "import/no-anonymous-default-export": "off",
      "unicorn/no-null": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/no-useless-undefined": "error",
      "unicorn/prefer-ternary": "warn",
      "unicorn/no-unnecessary-await": "error",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "dist/**",
  ]),
]);

export default eslintConfig;
