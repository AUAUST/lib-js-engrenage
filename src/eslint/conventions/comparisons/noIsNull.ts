import { defineReplacement } from "#eslint/conventions/defineReplacement";

export default defineReplacement({
  selector: "CallExpression[callee.name='isNull']",
  target:
    "`isNull(x)` calls (keep `isNull` for callbacks such as `filter(items, isNull)`)",
  replacement: "`x === null`",
  requires: ["@auaust/toolkit"],
});
