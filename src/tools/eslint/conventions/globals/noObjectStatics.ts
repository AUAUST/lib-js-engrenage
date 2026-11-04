import { toolkit } from "#constants";
import { defineGlobalReplacement } from "#tools/eslint/utils/defineGlobalReplacement";

export default defineGlobalReplacement({
  global: "Object",
  replacement: `the \`${toolkit}/object\` equivalent`,
  requires: [toolkit],
});
