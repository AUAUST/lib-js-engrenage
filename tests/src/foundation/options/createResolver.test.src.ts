import { describe, expect, test } from "vitest";

import { getOwn } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/config/declarers/declareSection";
import { createResolver } from "#foundation/options/utils/createResolver";
import type { Resolver } from "#foundation/options/types/Resolver";
import type { Section } from "#foundation/options/types/Section";
import type { SectionSource } from "#foundation/options/types/SectionSource";

function createSource(
  sections: Readonly<Record<string, Section>>,
): SectionSource {
  async function load(key: string) {
    const section = getOwn(sections, key);

    return section === undefined ? undefined : { input: undefined, section };
  }

  return { load };
}

function createSourceResolver(sections: Readonly<Record<string, Section>>) {
  return createResolver({}, undefined, { sections: createSource(sections) });
}

describe("createResolver", () => {
  test("resolves a shared key once for sections reading it in parallel", async () => {
    let calls = 0;

    const base = declareSection({
      async resolve() {
        calls += 1;

        await Promise.resolve();

        return 1;
      },
    });

    const left = declareSection({
      async resolve(_input, config): Promise<number> {
        return Number(await config.resolve("base")) + 1;
      },
    });

    const right = declareSection({
      async resolve(_input, config): Promise<number> {
        return Number(await config.resolve("base")) + 2;
      },
    });

    const { resolve } = createSourceResolver({
      base,
      left,
      right,
    });

    expect(await Promise.all([resolve("left"), resolve("right")])).toEqual([
      2, 3,
    ]);

    expect(calls).toBe(1);
  });

  test("fails with the path of keys depending on each other", async () => {
    const first = declareSection({
      resolve(_input, config): Promise<unknown> {
        return config.resolve("second");
      },
    });

    const second = declareSection({
      resolve(_input, config): Promise<unknown> {
        return config.resolve("third");
      },
    });

    const third = declareSection({
      resolve(_input, config): Promise<unknown> {
        return config.resolve("second");
      },
    });

    const { resolve } = createSourceResolver({
      first,
      second,
      third,
    });

    await expect(resolve("first")).rejects.toThrow(
      "Config keys depend on each other: first -> second -> third -> second",
    );
  });

  test("fails on an unknown key read by a section, naming both", async () => {
    const reader = declareSection({
      resolve(_input, config): Promise<unknown> {
        return config.resolve("missing");
      },
    });

    const { resolve } = createSourceResolver({ reader });

    await expect(resolve("reader")).rejects.toThrow(
      'Unknown config key "missing", read by "reader"',
    );
  });

  test("re-resolves a memoized key when a live key it read changes", async () => {
    const versions = {
      a: { content: "a" },
      b: { content: "b" },
    };

    let current = versions.a;

    let calls = 0;

    const live = declareSection({
      live: true,
      resolve() {
        return current;
      },
    });

    const derived = declareSection({
      async resolve(
        _input,
        config: Resolver<unknown, { live: { content: string } }>,
      ): Promise<string> {
        calls += 1;

        return (await config.resolve("live")).content;
      },
    });

    const { resolve } = createSourceResolver({ live, derived });

    expect(await resolve("derived")).toBe("a");

    current = versions.b;

    expect(await resolve("derived")).toBe("b");
    expect(calls).toBe(2);
  });

  test("keeps a memoized key while the live keys it read resolve to the same object", async () => {
    const file = { content: "a" };

    let calls = 0;

    const live = declareSection({
      live: true,
      resolve() {
        return file;
      },
    });

    const derived = declareSection({
      async resolve(_input, config): Promise<unknown> {
        calls += 1;

        return (await config.resolve("live")) === file;
      },
    });

    const { resolve } = createSourceResolver({ live, derived });

    await resolve("derived");

    await resolve("derived");

    expect(calls).toBe(1);
  });
});
