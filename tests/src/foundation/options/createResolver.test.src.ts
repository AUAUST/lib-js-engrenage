import { describe, expect, test } from "vitest";

import { declareSection } from "#foundation/options/config/declarers/declareSection";
import { createResolver } from "#foundation/options/utils/createResolver";

describe("createResolver", () => {
  test("resolves a shared dependency once for sections resolved in parallel", async () => {
    let calls = 0;

    const base = declareSection({
      name: "base",
      async resolve() {
        calls += 1;

        await Promise.resolve();

        return 1;
      },
    });

    const left = declareSection({
      name: "left",
      async resolve(_input, config) {
        return (await config.resolve(base)) + 1;
      },
    });

    const right = declareSection({
      name: "right",
      async resolve(_input, config) {
        return (await config.resolve(base)) + 2;
      },
    });

    const { resolve } = createResolver({}, undefined);

    expect(await Promise.all([resolve(left), resolve(right)])).toEqual([2, 3]);
    expect(calls).toBe(1);
  });

  test("fails with the path of sections reading each other", async () => {
    const first = declareSection({
      name: "first",
      resolve(_input, config): Promise<unknown> {
        return config.resolve(second);
      },
    });

    const second = declareSection({
      name: "second",
      resolve(_input, config): Promise<unknown> {
        return config.resolve(third);
      },
    });

    const third = declareSection({
      name: "third",
      resolve(_input, config): Promise<unknown> {
        return config.resolve(second);
      },
    });

    const { resolve } = createResolver({}, undefined);

    await expect(resolve(first)).rejects.toThrow("second -> third -> second");
  });

  test("re-resolves a memoized section when a live section it read changes", async () => {
    const versions = {
      a: { content: "a" },
      b: { content: "b" },
    };

    let current = versions.a;

    let calls = 0;

    const live = declareSection({
      name: "live",
      live: true,
      resolve() {
        return current;
      },
    });

    const derived = declareSection({
      name: "derived",
      async resolve(_input, config) {
        calls += 1;

        return (await config.resolve(live)).content;
      },
    });

    const { resolve } = createResolver({}, undefined);

    expect(await resolve(derived)).toBe("a");

    current = versions.b;

    expect(await resolve(derived)).toBe("b");
    expect(calls).toBe(2);
  });

  test("keeps a memoized section while the live sections it read resolve to the same object", async () => {
    const file = { content: "a" };

    let calls = 0;

    const live = declareSection({
      name: "live",
      live: true,
      resolve() {
        return file;
      },
    });

    const derived = declareSection({
      name: "derived",
      async resolve(_input, config) {
        calls += 1;

        return (await config.resolve(live)).content;
      },
    });

    const { resolve } = createResolver({}, undefined);

    await resolve(derived);

    await resolve(derived);

    expect(calls).toBe(1);
  });
});
