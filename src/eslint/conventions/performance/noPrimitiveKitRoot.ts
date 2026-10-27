import { primitiveKit } from "#constants";
import { defineImportReplacement } from "#eslint/conventions/defineImportReplacement";

export default defineImportReplacement({
  source: primitiveKit,
  replacement: `the \`${primitiveKit}/<domain>\` subpath entries`,
  files: ["public", "scripts"],
  presets: ["library"],
  requires: [primitiveKit],
});
