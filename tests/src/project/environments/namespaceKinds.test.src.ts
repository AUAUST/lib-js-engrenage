import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

const fixture = {
  name: "kinds-fixture",
  contributes: {
    presets: [
      {
        name: "fixture",
        traits: [],
        load() {
          return Promise.resolve({
            "namespaceKinds.scripts.imports": {},
          });
        },
      },
    ],
  },
};

function createConfig(input: Readonly<Record<string, unknown>>) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "src/.gitkeep": "",
    "bin/.gitkeep": "",
    "scripts/.gitkeep": "",
    "data/.gitkeep": "",
  });

  return createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({ extensions: [fixture], ...input }),
    configFile: undefined,
  });
}

describe("namespaceKinds", () => {
  test("replaces the imports of the contributed kind it names", async () => {
    const config = createConfig({
      namespaceKinds: {
        bin: {
          imports: { src: "whole" },
        },
      },
    });

    const { surface, namespaces } = await config.resolve("importGrants");

    expect(surface.bin ?? []).not.toContain("src");

    expect(namespaces.bin).not.toContain("internal-aliases");
  });

  test("takes a preset's value under the project's own", async () => {
    const preset = createConfig({ preset: "fixture" });

    const project = createConfig({
      preset: "fixture",
      namespaceKinds: {
        scripts: {
          imports: { data: "whole" },
        },
      },
    });

    expect((await preset.resolve("importGrants")).namespaces.scripts).toContain(
      "data",
    );

    expect(
      (await project.resolve("importGrants")).namespaces.scripts,
    ).not.toContain("data");
  });

  test("fails on a name no contributed kind takes", async () => {
    const config = createConfig({
      namespaceKinds: {
        unknown: {},
      },
    });

    await expect(config.resolve("namespaceKinds")).rejects.toThrow(
      "names unknown, which no contributed namespace kind takes",
    );
  });
});
