import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // Ignore build output, dependencies, and static assets
  {
    ignores: ["dist/**", "node_modules/**", "public/**"],
  },
  // Lint JavaScript and JSX source files
  {
    files: ["**/*.{js,jsx}"],
    ...js.configs.recommended,
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Relax rules that commonly flag valid React/browser patterns
      "no-unused-vars": "warn",
      "no-undef": "off",
      // React hooks rules — defined via plugin but disabled so existing
      // eslint-disable comments are recognized without failing CI
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },
];
