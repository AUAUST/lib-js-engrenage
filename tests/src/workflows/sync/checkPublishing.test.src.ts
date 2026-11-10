import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const placeholder = "{dir}";

const library = `{
  preset: "library",
  visibility: "private",
  runtime: { node: 24 },
  src: { node: 24 },
  build: { outDir: "dist" },
  workspaces: { "extensions/*": { name: "ext-${placeholder}" } },
}`;

async function check(
  config: string,
  manifest: object,
  files: Record<string, string> = {},
) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", ...manifest }),
    "engrenage.config.ts": `export default ${config};`,
    "src/index.ts": "",
    ...files,
  });

  const [failure] = await runSync(await loadConfig(project.root), {
    names: ["package", "publishing"],
  });

  if (failure !== undefined) {
    throw failure.error;
  }
}

function createWorkspace(manifest: object) {
  return {
    "extensions/a/src/index.ts": "",
    "extensions/a/package.json": JSON.stringify({
      name: "ext-a",
      ...manifest,
    }),
  };
}

describe("checkPublishing", () => {
  test("fails on an unscoped library resolving private, naming the package and the visibility", async () => {
    const result = check(library, { name: "unscoped" });

    await expect(result).rejects.toThrow("private visibility");

    await expect(result).rejects.toThrow("unscoped is unscoped");
  });

  test("passes on an unscoped workspace marked private and fails on it without private", async () => {
    const manifest = { name: "@scope/library" };

    await expect(
      check(library, manifest, createWorkspace({ private: true })),
    ).resolves.toBeUndefined();

    await expect(
      check(
        library,
        manifest,
        createWorkspace({
          publishConfig: { access: "restricted" },
        }),
      ),
    ).rejects.toThrow("extensions/a/package.json: the package ext-a");
  });

  test("fails on a credential in the project .npmrc without the published trait", async () => {
    await expect(
      check(
        "{ runtime: { node: 24 } }",
        {
          name: "project",
        },
        {
          ".npmrc": "//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n",
        },
      ),
    ).rejects.toThrow(".npmrc: holds the credential");
  });
});
