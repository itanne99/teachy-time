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
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            pascalCase: true,
            camelCase: true,
          },
        },
      ],
      "unicorn/prevent-abbreviations": [
        "error",
        {
          allowList: {
            props: true,
            ref: true,
            params: true,
            env: true,
          },
        },
      ],
      "unicorn/no-null": "off",
      "unicorn/explicit-length-check": [
        "error",
        {
          "non-zero": "greater-than",
        },
      ],
      "unicorn/no-array-for-each": "warn",
      "unicorn/consistent-function-scoping": "warn",
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
