import { describe, expect, test } from "vitest";

import * as builtins from "@auaust/engrenage/builtins";
import { camel } from "@auaust/toolkit";
import { entries } from "@auaust/toolkit/object";

describe("builtins", () => {
  test("exports each extension, sub-domains included, under its domain path", () => {
    const names = entries(builtins).map(([exported, { name }]) => {
      expect(camel(name.replaceAll("/", " "))).toBe(exported);

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
