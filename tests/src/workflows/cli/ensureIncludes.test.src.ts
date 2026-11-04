import { describe, expect, test } from "vitest";

import { ensureIncludes } from "#workflows/cli/operations/ensureIncludes";

describe("ensureIncludes", () => {
  test("adds a missing option with its value once", () => {
    const args = ["src"];

    ensureIncludes(args, ["--mode", "build"]);
    ensureIncludes(args, ["--mode", "build"]);

    expect(args).toEqual(["src", "--mode", "build"]);
  });
});
