import { describe, expect, test } from "vitest";

import * as builtins from "@auaust/engrenage/builtins";
import { entries } from "@auaust/toolkit/object";
import { toCamelCase } from "@auaust/toolkit/string";

describe("builtins", () => {
  test("exports each extension, sub-domains included, under its domain path", () => {
    const names = entries(builtins).map(([exported, { name }]) => {
      expect(toCamelCase(name.replaceAll("/", " "))).toBe(exported);

      return name;
    });

    expect(names).toEqual(
      expect.arrayContaining([
        "tools/agents",
        "tools/agents/claude",
        "tools/agents/codex",
        "tools/shopify/theme",
      ]),
    );
  });
});
