import { zod } from "#constants";
import { defineImportReplacement } from "#eslint/utils/defineImportReplacement";

export default defineImportReplacement({
  source: zod,
  replacement: "`zod/mini`",
  files: ["files.code.published", "files.scripts"],
  presets: ["library"],
  requires: [zod],
});
