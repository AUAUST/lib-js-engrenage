import { describe, expect, test } from "vitest";

import { loadLazy } from "#foundation/modules/index";

describe("loadLazy", () => {
  test("resolves a module to its only export", async () => {
    const loaded = await loadLazy<() => string>({
      load() {
        return import("#tests/fixtures/modules/namedExport");
      },
    });

    expect(loaded()).toBe("named");
  });

  test("resolves a module to its default export", async () => {
    const loaded = await loadLazy<() => string>({
      load() {
        return import("#tests/fixtures/modules/defaultExport");
      },
    });

    expect(loaded()).toBe("default");
  });

  test("returns a plain single-key object unchanged", async () => {
    const value = { only: 1 };

    await expect(loadLazy({ load: () => value })).resolves.toBe(value);
  });

  test("throws on a module with several exports", async () => {
    await expect(
      loadLazy<number>({
        load() {
          return import("#tests/fixtures/modules/twoExports");
        },
      }),
    ).rejects.toThrow(
      new TypeError(
        "A lazy loader must load a module with a default export or exactly one export; it exports first, second",
      ),
    );
  });
});
