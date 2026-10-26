import { defineImportReplacement } from "#eslint/conventions/defineImportReplacement";

export default defineImportReplacement({
  source: "@auaust/primitive-kit",
  replacement: "the `@auaust/primitive-kit/<domain>` subpath entries",
  files: ["directories.source"],
  presets: ["library"],
});
