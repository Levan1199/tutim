const js = require("@eslint/js");
const globals = require("globals");
module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/public/**",
      "test-results/**",
    ],
  },
  {
    files: ["client/src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    rules: {
      "no-undef": "error",
      "no-unreachable": "error",
      "valid-typeof": "error",
    },
  },
  {
    files: ["server/**/*.js", "tests/*.cjs"],
    languageOptions: { sourceType: "commonjs", globals: globals.node },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { args: "none" }],
    },
  },
];
