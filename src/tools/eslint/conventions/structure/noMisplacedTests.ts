import { defineRestriction } from "#eslint/conventions/defineRestriction";

export default defineRestriction({
  selector: "Program",
  message: "Test files belong under the test directories.",
  files: ["files.test"],
  ignores: ["files.tests"],
});
