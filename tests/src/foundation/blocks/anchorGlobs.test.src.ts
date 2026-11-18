import { describe, expect, test } from "vitest";

import { anchorGlobs } from "#foundation/blocks/utils/anchorGlobs";

describe("anchorGlobs", () => {
  test("expands brace alternatives into anchored patterns", () => {
    expect(anchorGlobs("**/*.{ts,tsx}")).toStrictEqual([
      "/**/*.ts",
      "/**/*.tsx",
    ]);
  });

  test("keeps the negation of each alternative before its anchor", () => {
    expect(anchorGlobs("!dist/{a,b}")).toStrictEqual(["!/dist/a", "!/dist/b"]);
  });
});
