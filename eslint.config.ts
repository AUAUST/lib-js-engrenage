import { createEslintConfig } from "./src/eslint/index";

export default createEslintConfig({
  root: new URL("./", import.meta.url),
  sourceDirectories: ["src"],
  defaultExportFiles: ["src/prettier/index.ts"],
  ignores: ["tests/fixtures/**"],
});
