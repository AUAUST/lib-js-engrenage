import { zod } from "#constants";
import { defineImportReplacement } from "#tools/eslint/utils/defineImportReplacement";

export default defineImportReplacement({
  source: zod,
  replacement: "`zod/mini`",
  files: ["files.code.published", "files.scripts"],
  traits: ["published"],
  requires: [zod],
});
