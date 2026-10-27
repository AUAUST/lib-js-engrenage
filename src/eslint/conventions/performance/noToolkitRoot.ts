import { toolkit } from "#constants";
import { defineImportReplacement } from "#eslint/conventions/defineImportReplacement";

export default defineImportReplacement({
  source: toolkit,
  replacement: `the \`${toolkit}/<helper>\` subpath entries`,
  files: ["files.code.published", "files.scripts"],
  presets: ["library"],
  requires: [toolkit],
});
