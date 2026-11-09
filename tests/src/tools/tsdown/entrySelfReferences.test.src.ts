import { pathToFileURL } from "node:url";

import { build } from "tsdown";
import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTsdownConfig } from "#tools/tsdown/operations/createTsdownConfig";
import type { Options } from "#tools/tsdown/types/Options";

async function buildProject(options?: Options) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@scope/package",
      type: "module",
      exports: {
        ".": {
          types: "./dist/index.d.mts",
          default: "./dist/index.mjs",
        },
        "./object": {
          types: "./dist/object.d.mts",
          default: "./dist/object.mjs",
        },
      },
    }),
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        outDir: "dist",
        module: "ESNext",
        moduleResolution: "Bundler",
        strict: true,
        paths: {
          "@scope/package": ["./src/index.ts"],
          "@scope/package/object": ["./src/object/index.ts"],
        },
      },
      include: ["src"],
    }),
    "src/index.ts": [
      'export * as object from "./object/index.ts";',
      'import { shared } from "./shared.ts";',
      "export const value = shared;",
    ].join("\n"),
    "src/object/index.ts": [
      'import { shared } from "../shared.ts";',
      "export const keys = () => shared;",
    ].join("\n"),
    "src/shared.ts": 'export const shared = "shared";',
  });

  const config = await loadConfig(project.root);

  await build({
    ...(await createTsdownConfig(config, { ci: false }, options)),
    config: false,
    logLevel: "silent",
  });

  return project;
}

describe("entry-self-references", () => {
  test("keeps the namespace identity of an entry across entries", async () => {
    const project = await buildProject();

    const root = await import(
      pathToFileURL(project.resolve("dist/index.mjs")).href
    );

    const object = await import(
      pathToFileURL(project.resolve("dist/object.mjs")).href
    );

    expect(root.object).toBe(object);

    expect(project.read("dist/index.mjs")).toContain(
      'from "@scope/package/object"',
    );

    expect(project.read("dist/index.d.mts")).not.toContain(
      "@scope/package/object",
    );
  });

  test("keeps a module that is not an entry bundled", async () => {
    const project = await buildProject();

    expect(project.read("dist/index.mjs")).not.toContain(
      "@scope/package/shared",
    );

    expect(project.read("dist/object.mjs")).not.toContain(
      "@scope/package/shared",
    );
  });

  test("restores the bundled output when turned off", async () => {
    const project = await buildProject({
      plugins: { "entry-self-references": false },
    });

    expect(project.read("dist/index.mjs")).not.toContain(
      "@scope/package/object",
    );
  });
});
