import { defineGlobalReplacement } from "#eslint/conventions/defineGlobalReplacement";

export default defineGlobalReplacement({
  global: "Array.isArray",
  replacement: "`isArray` from @auaust/toolkit",
  requires: ["@auaust/toolkit"],
});
