import { defineConfig } from "#config/index";

export default defineConfig({
  presets: ["library"],
  directories: {
    source: ["src", "bin"],
  },
  files: {
    config: ["*.config.ts", ".*.ts", "src/prettier/index.ts"],
    discovered: ["bin/**/*.ts", "src/eslint/conventions/*/*.ts"],
    generated: ["src/eslint/types/Rules.ts", "src/eslint/types/rules/**"],
  },
});
