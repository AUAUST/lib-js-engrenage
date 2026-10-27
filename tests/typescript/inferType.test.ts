import { describe, expect, test } from "vitest";

import { inferType } from "@auaust/engrenage/typescript";

const value = {
  "name": "engrenage",
  "flags": [true, 1],
  "empty": [],
  "kebab-key": null,
};

describe("inferType", () => {
  test("widens like a let declaration by default", () => {
    expect(inferType(value, false)).toBe(
      [
        "{",
        "  name: string;",
        "  flags: (boolean | number)[];",
        "  empty: unknown[];",
        '  "kebab-key": null;',
        "}",
      ].join("\n"),
    );
  });

  test("keeps literal types like an as const assertion when exact", () => {
    expect(inferType(value, true)).toBe(
      [
        "{",
        '  readonly name: "engrenage";',
        "  readonly flags: readonly [true, 1];",
        "  readonly empty: readonly [];",
        '  readonly "kebab-key": null;',
        "}",
      ].join("\n"),
    );
  });
});
