import { toolkit } from "#constants";
import { defineImportReplacement } from "#tools/eslint/utils/defineImportReplacement";

export default defineImportReplacement({
  source: toolkit,
  replacement: `the \`${toolkit}/<helper>\` subpath entries`,
  files: ["files.code.published", "files.scripts"],
  presets: ["library"],
  requires: [toolkit],
});
