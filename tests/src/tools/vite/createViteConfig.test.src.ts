import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createViteConfig } from "#tools/vite/operations/createViteConfig";

async function loadProject(
  config: Record<string, unknown>,
  files: Record<string, string> = {},
) {
  const project = createTemporaryProject({
    "package.json": '{ "type": "module" }',
    "engrenage.config.ts": `export default ${JSON.stringify(config)};\n`,
    ...files,
  });

  return await loadConfig(project.root);
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
});
