import { zod } from "#constants";
import { defineImportReplacement } from "#eslint/utils/defineImportReplacement";

export default defineImportReplacement({
  source: `${zod}/mini`,
  imports: ["default", "z"],
  replacement: "named imports",
  files: ["files.code.published", "files.scripts"],
  presets: ["library"],
  requires: [zod],
});
