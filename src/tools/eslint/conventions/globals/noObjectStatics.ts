import { toolkit } from "#constants";
import { defineGlobalReplacement } from "#eslint/utils/defineGlobalReplacement";

export default defineGlobalReplacement({
  global: "Object",
  replacement: `the \`${toolkit}/object\` equivalent`,
  requires: [toolkit],
});
