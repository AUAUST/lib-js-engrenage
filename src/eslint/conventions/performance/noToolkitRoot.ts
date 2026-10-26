import { defineImportReplacement } from "#eslint/conventions/defineImportReplacement";

export default defineImportReplacement({
  source: "@auaust/toolkit",
  replacement: "the `@auaust/toolkit/<helper>` subpath entries",
  files: ["directories.source"],
  presets: ["library"],
  requires: ["@auaust/toolkit"],
});
