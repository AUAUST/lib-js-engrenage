import { describe, expect, test } from "vitest";

import { ensureAnyOf } from "#support/commander/utils/ensureAnyOf";

describe("ensureAnyOf", () => {
  test("inserts the fallback before the positional arguments", () => {
    const args = ["--cache", "--", "--check"];

    ensureAnyOf(args, ["--check", "--write"], "--write");

    expect(args).toEqual(["--cache", "--write", "--", "--check"]);
  });

  test("keeps the arguments when an option is set with a value", () => {
    const args = ["--project=tsconfig.dist.json"];

    ensureAnyOf(args, ["--project", "-p"], ["--project", "tsconfig.json"]);

    expect(args).toEqual(["--project=tsconfig.dist.json"]);
  });
});
