import { describe, expect, test } from "vitest";

import { ensureUnset } from "#support/commander/utils/ensureUnset";

describe("ensureUnset", () => {
  test("removes every form of the options before the positional arguments", () => {
    const args = ["-w", "src", "--write=true", "--", "--write"];

    ensureUnset(args, ["--write", "-w"]);

    expect(args).toEqual(["src", "--", "--write"]);
  });
});
