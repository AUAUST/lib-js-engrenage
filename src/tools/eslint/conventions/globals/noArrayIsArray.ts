import { toolkit } from "#constants";
import { defineGlobalReplacement } from "#eslint/utils/defineGlobalReplacement";

export default defineGlobalReplacement({
  global: "Array",
  properties: ["isArray"],
  replacement: `\`isArray\` from ${toolkit}`,
  requires: [toolkit],
});
