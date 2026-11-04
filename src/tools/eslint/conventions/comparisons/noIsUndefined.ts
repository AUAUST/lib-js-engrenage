import { toolkit } from "#constants";
import { defineReplacement } from "#eslint/conventions/defineReplacement";

export default defineReplacement({
  selector: "CallExpression[callee.name='isUndefined']",
  target:
    "`isUndefined(x)` calls (keep `isUndefined` for callbacks such as `filter(items, isUndefined)`)",
  replacement: "`x === undefined`",
  requires: [toolkit],
});
