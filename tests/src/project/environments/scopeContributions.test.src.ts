import { describe, expect, test } from "vitest";

import { createProjectConfig, type RawConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

const themeExtension = {
  name: "theme-fixture",
  when: {
    preset: "library",
  },
  contributes: {
    namespaceKinds: [{ name: "theme-kind", level: "enforced" }],
    environmentPresets: [{ name: "theme-preset" }],
  },
};

function loadProject({
  input = {},
  metafile = {},
}: {
  input?: RawConfig;
  metafile?: RawConfig;
}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "root", type: "module" }),
    "src/index.ts": "export {};\n",
    "theme/package.json": JSON.stringify({ name: "theme", type: "module" }),
    "theme/.workspace.json": JSON.stringify(metafile),
    "theme/layout/theme.liquid": "",
    "theme/src/index.ts": "export {};\n",
  });

  return createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({
      extensions: [themeExtension],
      ...input,
      workspaces: {
        theme: { name: "theme" },
      },
    }),
    configFile: undefined,
  });
}

function listNames(entries: readonly { readonly name: string }[]) {
  return entries.map(({ name }) => name);
}

async function listRegistered(config: ReturnType<typeof loadProject>) {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  return environments.registered.map(({ scope, registration, preset }) => {
    return [scope, registration.name, preset.name];
  });
}

describe("scope contributions", () => {
  test("give a workspace alone the kinds and presets of the extensions it activates", async () => {
    const config = loadProject({
      metafile: {
        preset: "library",
        environments: {
          liquid: { preset: "theme-preset", dirs: ["layout"] },
        },
      },
    });

    const child = await config.context.scope("theme");

    expect(listNames(await child.resolve("namespaceKinds"))).toContain(
      "theme-kind",
    );

    expect(listNames(await child.resolve("environmentPresets"))).toContain(
      "theme-preset",
    );

    expect(listNames(await config.resolve("namespaceKinds"))).not.toContain(
      "theme-kind",
    );

    expect(listNames(await config.resolve("environmentPresets"))).not.toContain(
      "theme-preset",
    );

    expect(await listRegistered(config)).toContainEqual([
      "theme",
      "liquid",
      "theme-preset",
    ]);
  });

  test("accept a root override naming a kind only a workspace activates", async () => {
    const config = loadProject({
      input: {
        namespaceKinds: {
          "theme-kind": { inward: "sealed" },
        },
      },
      metafile: {
        preset: "library",
      },
    });

    const child = await config.context.scope("theme");

    const kinds = await child.resolve("namespaceKinds");

    expect(kinds.find(({ name }) => name === "theme-kind")?.inward).toBe(
      "sealed",
    );
  });

  test("resolve a workspace's inherited registration with a preset only the root activates", async () => {
    const config = loadProject({
      input: {
        preset: "library",
        environments: {
          edge: { preset: "theme-preset", dirs: ["edge"] },
        },
      },
    });

    const child = await config.context.scope("theme");

    expect(listNames(await child.resolve("environmentPresets"))).toContain(
      "theme-preset",
    );

    expect(await listRegistered(config)).toContainEqual([
      "theme",
      "edge",
      "theme-preset",
    ]);
  });
});
