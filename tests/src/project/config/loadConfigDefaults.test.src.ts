import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";

describe("loadConfig", () => {
  test("falls back to defaults and warns once per root without a config file or package file", async () => {
    const reporter = createTestReporter();

    const first = createTemporaryProject().root;
    const second = createTemporaryProject().root;

    const config = await loadConfig(first, { reporter });

    await loadConfig(second, { reporter });

    loadConfig.refresh(first);

    await loadConfig(first, { reporter });

    expect(reporter.messages.map(({ text }) => text)).toEqual([
      `No engrenage config found in ${first}, using defaults`,
      `No engrenage config found in ${second}, using defaults`,
    ]);

    expect(config.context.root).toBe(first);

    expect((await config.resolve("typescript")).files).toEqual([
      "**/*.{ts,tsx}",
    ]);

    expect((await config.resolve("files")).generated).toEqual([
      ".engrenage/sync.json",
      "pnpm-lock.yaml",
    ]);

    expect(await config.resolve("packageJsonPath")).toBeUndefined();

    expect((await config.resolve("packageJson")).optional.name).toBeUndefined();

    expect((await config.resolve("tsconfig")).optional.outDir).toBeUndefined();

    await expect(
      async () => (await config.resolve("tsconfig")).outDir,
    ).rejects.toThrow(`No tsconfig found in ${first}`);

    expect(await config.resolve("preset")).toBe(false);

    expect(await config.resolve("traits")).toEqual({
      published: false,
    });

    expect(
      (await config.resolve("dependencies")).hasDependency("valibot"),
    ).toBe(false);
  });

  test("reports a duplicated tooling directory", async () => {
    const reporter = createTestReporter();

    const { root } = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": 'export default { tooling: { dirs: ["config", "config"] } };',
    });

    const config = await loadConfig(root, { reporter });

    await config.resolve("tooling.options");

    expect(reporter.warnings).toContain(
      "tooling.dirs lists config more than once",
    );
  });
});
