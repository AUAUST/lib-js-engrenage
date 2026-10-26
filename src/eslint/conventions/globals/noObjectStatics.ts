import { defineGlobalReplacement } from "#eslint/conventions/defineGlobalReplacement";

export default defineGlobalReplacement({
  global: "Object",
  replacement: "the @auaust/toolkit/object equivalent",
  requires: ["@auaust/toolkit"],
});
