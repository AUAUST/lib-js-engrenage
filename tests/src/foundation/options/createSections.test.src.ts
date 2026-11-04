import { describe, expect, test } from "vitest";

import { createSections } from "#foundation/options/utils/createSections";

interface Sections {
  a: number;
  b: number;
  c: number;
}

describe("createSections", () => {
  test("resolves a section once and lets sections read lower ones", () => {
    let calls = 0;

    const { get } = createSections<Sections>({
      a: () => {
        calls += 1;

        return 1;
      },
      b: (read) => read("a") + 1,
      c: (read) => read("a") + read("b"),
    });

    expect(get("c")).toBe(3);
    expect(get("b")).toBe(2);
    expect(calls).toBe(1);
  });

  test("fails with the path of sections reading each other", () => {
    const { get } = createSections<Sections>({
      a: (read) => read("b"),
      b: (read) => read("c"),
      c: (read) => read("b"),
    });

    expect(() => get("a")).toThrow("b -> c -> b");
  });

  test("recomputes live sections", () => {
    let value = 0;

    const { get } = createSections<Sections>(
      {
        a: () => {
          value += 1;

          return value;
        },
        b: () => 0,
        c: () => 0,
      },
      ["a"],
    );

    expect([get("a"), get("a")]).toEqual([1, 2]);
  });
});
