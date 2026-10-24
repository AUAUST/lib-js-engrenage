import { createEslintConfig } from "./src/eslint/index";

export default createEslintConfig({
  root: new URL("./", import.meta.url),
  sourceDirectories: ["src"],
  ignores: ["tests/fixtures/**"],
});
