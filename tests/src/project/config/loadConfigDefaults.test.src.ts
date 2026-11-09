import { afterEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loadConfig", () => {
  test("falls back to defaults and warns once without a config file or package file", async () => {
    vi.resetModules();

    const { loadConfig: loadFreshConfig } =
      await import("#project/config/operations/loadConfig");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const first = createTemporaryProject().root;

    const config = await loadFreshConfig(first);

    await loadFreshConfig(createTemporaryProject().root);

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      `No engrenage config found in ${first}, using defaults`,
    );

    expect(config.context.root).toBe(first);

    expect((await config.resolve("typescript")).files).toEqual([
      "**/*.{ts,tsx}",
    ]);

    expect((await config.resolve("files")).generated).toEqual([]);
    expect(await config.resolve("packageJsonPath")).toBeUndefined();

    expect((await config.resolve("packageJson")).optional.name).toBeUndefined();

    expect((await config.resolve("tsconfig")).optional.outDir).toBeUndefined();

    await expect(
      async () => (await config.resolve("tsconfig")).outDir,
    ).rejects.toThrow(`No tsconfig found in ${first}`);

    expect(await config.resolve("preset")).toBeUndefined();
    expect(await config.resolve("traits")).toEqual({ published: false });

    expect((await config.resolve("environment")).hasDependency("valibot")).toBe(
      false,
    );
  });
});
