import { defineImportReplacement } from "#eslint/conventions/defineImportReplacement";

export default defineImportReplacement({
  source: "zod/mini",
  imports: ["*", "default", "z"],
  replacement: "named imports",
  files: ["directories.source"],
  presets: ["library"],
});
