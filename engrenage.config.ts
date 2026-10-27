import { defineConfig } from "#config/index";

export default defineConfig({
  presets: ["library"],
  code: {
    configFiles: ["*.config.ts", ".*.ts", "src/prettier/index.ts"],
    discoveredFiles: [
      "bin/**/*.ts",
      "scripts/**/*.ts",
      "src/eslint/conventions/*/*.ts",
    ],
    generatedFiles: ["src/eslint/types/Rules.ts", "src/eslint/types/rules/**"],
  },
});
