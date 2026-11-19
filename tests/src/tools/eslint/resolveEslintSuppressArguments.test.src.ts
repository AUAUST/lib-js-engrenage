import { expect, test } from "vitest";

import { resolveEslintSuppressArguments } from "#tools/eslint/index";

test("adds no --suppress-all beside --prune-suppressions", () => {
  expect(
    resolveEslintSuppressArguments(["--prune-suppressions"]),
  ).not.toContain("--suppress-all");
});
