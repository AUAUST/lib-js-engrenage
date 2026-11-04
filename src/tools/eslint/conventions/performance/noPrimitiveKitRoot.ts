import { primitiveKit } from "#constants";
import { defineImportReplacement } from "#eslint/utils/defineImportReplacement";

export default defineImportReplacement({
  source: primitiveKit,
  replacement: `the \`${primitiveKit}/<domain>\` subpath entries`,
  files: ["files.code.published", "files.scripts"],
  presets: ["library"],
  requires: [primitiveKit],
});
