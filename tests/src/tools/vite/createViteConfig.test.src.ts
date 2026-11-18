import { join } from "node:path";

import { mergeConfig } from "vite";
import { describe, expect, test } from "vitest";

import { resolveBuildTarget } from "#project/baseline/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { createViteConfig } from "#tools/vite/operations/createViteConfig";
import type { Reporter } from "#foundation/reports/index";

const viteManifest = JSON.stringify({
  type: "module",
  devDependencies: { vite: "*" },
});

async function loadProject(
  config: Record<string, unknown>,
  files: Record<string, string> = {},
  reporter: Reporter = createTestReporter(),
) {
  const project = createTemporaryProject({
    "package.json": '{ "type": "module" }',
    "engrenage.config.ts": `export default ${JSON.stringify(config)};\n`,
    ...files,
  });

  return await loadConfig(project.root, { reporter });
}

describe("createViteConfig", () => {
  test.each([
    [
      "keepNames",
      {
        build: { minify: "keepNames" },
      },
      true,
      true,
    ],
    [
      "true",
      {
        build: { minify: true },
      },
      true,
      false,
    ],
    [
      "false",
      {
        build: { minify: false },
      },
      false,
      false,
    ],
  ])(
    "maps build.minify %s to minification and kept names",
    async (_name, config, minify, keepNames) => {
      expect(
        await createViteConfig(await loadProject(config), {
          isTesting: false,
        }),
      ).toMatchObject({
        build: {
          minify,
          rolldownOptions: {
            output: { keepNames },
          },
        },
      });
    },
  );

  test.each([
    [
      "an unpublished",
      {
        traits: { disable: ["published"] },
      },
      true,
    ],
    [
      "a published",
      {
        preset: "library",
      },
      false,
    ],
  ])(
    "sets publicDir for %s project with a public directory",
    async (_name, config, served) => {
      const loaded = await loadProject(config, {
        "public/robots.txt": "",
      });

      expect(
        await createViteConfig(loaded, { isTesting: false }),
      ).toMatchObject({
        publicDir: served ? join(loaded.context.root, "public") : false,
      });
    },
  );

  test("anchors root at src and the output at the project root", async () => {
    const reporter = createTestReporter();

    const config = await loadProject(
      {
        build: { outDir: "dist" },
      },
      {
        "package.json": viteManifest,
        "src/index.html": "",
      },
      reporter,
    );

    const { root } = config.context;

    const vite = await createViteConfig(config, { isTesting: false });

    expect(vite).toMatchObject({
      root: join(root, "src"),
      envDir: root,
      build: { outDir: join(root, "dist") },
    });

    expect(mergeConfig(vite, { root }).build?.outDir).toBe(join(root, "dist"));

    expect(reporter.messages).toContainEqual(
      expect.objectContaining({
        level: "warn",
        text: expect.stringContaining("src.baseline is not set"),
      }),
    );
  });

  test("keeps the project root under tests", async () => {
    const reporter = createTestReporter();

    const config = await loadProject(
      {},
      { "package.json": viteManifest, "src/index.html": "" },
      reporter,
    );

    const vite = await createViteConfig(config, { isTesting: true });

    expect(vite.root).toBe(config.context.root);

    expect(reporter.messages).toContainEqual(
      expect.objectContaining({
        level: "warn",
        text: expect.stringContaining("src.baseline is not set"),
      }),
    );
  });

  test("fails outside tests with several src.dirs", async () => {
    const config = await loadProject(
      {
        src: { dirs: ["src", "app"] },
      },
      {
        "package.json": viteManifest,
        "src/index.html": "",
        "app/index.html": "",
      },
    );

    await expect(
      createViteConfig(config, { isTesting: false }),
    ).rejects.toThrow("Several src.dirs");
  });

  test("targets the same browsers as tsdown for a baseline", async () => {
    const config = await loadProject(
      {
        src: { baseline: "2026-10" },
      },
      {
        "package.json": viteManifest,
        "src/index.ts": "",
      },
    );

    const { runtime } = await config.resolve("src");

    if (runtime === undefined) {
      throw new Error("expected a source runtime");
    }

    const vite = await createViteConfig(config, { isTesting: false });

    expect(vite.build?.target).toEqual(resolveBuildTarget(runtime));
  });
});
