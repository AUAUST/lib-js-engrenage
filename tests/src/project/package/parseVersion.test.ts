import { describe, expect, test } from "vitest";

import { parseVersion } from "@auaust/engrenage/package";

describe("parseVersion", () => {
  test("yields the major, minor and patch of a specifier", () => {
    expect(parseVersion("^11.2.3")).toEqual({
      major: 11,
      minor: 2,
      patch: 3,
    });
  });

  test("yields nothing for a specifier without a version", () => {
    expect(parseVersion("latest")).toBeUndefined();
  });
});
