import { toolkit } from "#constants";
import { defineGlobalReplacement } from "#eslint/conventions/defineGlobalReplacement";

export default defineGlobalReplacement({
  global: "Array.isArray",
  replacement: `\`isArray\` from ${toolkit}`,
  requires: [toolkit],
});
