import { describe, expect, test } from "vitest";

import * as builtins from "@auaust/engrenage/builtins";
import { toCamelCase } from "@auaust/primitive-kit/strings";
import { entries, values } from "@auaust/toolkit/object";

describe("builtins", () => {
  test("names each extension uniquely by its domain path", () => {
    const names = values(builtins)
      .flat()
      .map(({ name }) => name);

    expect(new Set(names).size).toBe(names.length);

    for (const [exported, extension] of entries(builtins)) {
      const [first, ...others] = [extension].flat();

      expect(toCamelCase(first?.name ?? "")).toBe(exported);

      for (const other of others) {
        expect(other.name.startsWith(`${first?.name}/`)).toBe(true);
      }
    }

    expect(names).toEqual(
      expect.arrayContaining(["tools/agents/claude", "tools/agents/codex"]),
    );
  });
});
