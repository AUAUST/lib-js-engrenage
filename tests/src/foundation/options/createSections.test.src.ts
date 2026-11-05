import { describe, expect, test } from "vitest";

import { createSections } from "#foundation/options/utils/createSections";

interface Sections {
  a: number;
  b: number;
  c: number;
}

describe("createSections", () => {
  test("resolves a section once and lets sections read lower ones", async () => {
    let calls = 0;

    const { get } = createSections<Sections>({
      a: () => {
        calls += 1;

        return 1;
      },
      b: async (read) => (await read("a")) + 1,
      c: async (read) => (await read("a")) + (await read("b")),
    });

    expect(await get("c")).toBe(3);
    expect(await get("b")).toBe(2);
    expect(calls).toBe(1);
  });

  test("resolves a shared dependency once for sections resolved in parallel", async () => {
    let calls = 0;

    const { get } = createSections<Sections>({
      a: async () => {
        calls += 1;

        await Promise.resolve();

        return 1;
      },
      b: async (read) => (await read("a")) + 1,
      c: async (read) => (await read("a")) + 2,
    });

    expect(await Promise.all([get("b"), get("c")])).toEqual([2, 3]);
    expect(calls).toBe(1);
  });

  test("fails with the path of sections reading each other", async () => {
    const { get } = createSections<Sections>({
      a: (read) => read("b"),
      b: (read) => read("c"),
      c: (read) => read("b"),
    });

    await expect(get("a")).rejects.toThrow("b -> c -> b");
  });

  test("fails on a cycle between sections resolved in parallel", async () => {
    const { get } = createSections<Sections>({
      a: async (read) => {
        await Promise.resolve();

        return read("b");
      },
      b: async (read) => {
        await Promise.resolve();

        return read("a");
      },
      c: () => 0,
    });

    const results = await Promise.allSettled([get("a"), get("b")]);

    expect(results.some(({ status }) => status === "rejected")).toBe(true);
  });

  test("recomputes live sections", async () => {
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

    expect([await get("a"), await get("a")]).toEqual([1, 2]);
  });
});
