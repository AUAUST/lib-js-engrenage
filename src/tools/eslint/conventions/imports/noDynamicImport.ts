import { defineRestriction } from "#eslint/conventions/defineRestriction";

export default defineRestriction({
  selector: "ImportExpression",
  message:
    "Use static imports; dynamic import() is reserved for tests and framework discovery.",
  files: ["files.code.published", "files.scripts"],
});
