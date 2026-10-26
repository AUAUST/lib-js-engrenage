import { valibot } from "#constants";
import { defineImportReplacement } from "#eslint/conventions/defineImportReplacement";

export default defineImportReplacement({
  source: valibot,
  imports: ["*"],
  replacement: "named imports",
  files: ["directories.source"],
  presets: ["library"],
  requires: [valibot],
});
