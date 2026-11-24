import { describe, expect, test } from "vitest";

import { applyInputDefaults } from "#foundation/options/utils/applyInputDefaults";
import { createTestReporter } from "#tests/utils/createTestReporter";

function apply(input: unknown, lower: Readonly<Record<string, unknown>>) {
  return applyInputDefaults(
    input,
    "types",
    [{ name: "preset", values: lower }],
    createTestReporter(),
  ).value;
}

describe("applyInputDefaults", () => {
  test("composes an adjustment over a lower layer's adjustment leaves", () => {
    expect(
      apply(
        { append: "b" },
        { "types.prepend": "p", "types.append": ["a", "x"] },
      ),
    ).toEqual({
      prepend: ["p"],
      append: ["a", "x", "b"],
      exclude: [],
    });
  });

  test("drops the items a lower adjustment adds that a higher one excludes", () => {
    expect(
      apply(
        {
          exclude: ["x", "y"],
        },
        {
          types: { append: ["a", "x"] },
        },
      ),
    ).toEqual({
      prepend: [],
      append: ["a"],
      exclude: ["y"],
    });
  });
});
