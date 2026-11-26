import { describe, expect, test } from "vitest";

import { declareSection } from "#foundation/options/index";
import {
  createProjectConfig,
  type Extension,
  type RawConfig,
} from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

const themeDataOptionsSection = declareSection({
  resolve() {
    return { dirs: ["config"], kind: "data" };
  },
});

const themeExtension: Extension = {
  name: "theme-fixture",
  when: {
    preset: "library",
  },
  owns: {
    keys: {
      "theme-data.options": {
        load() {
          return Promise.resolve(themeDataOptionsSection);
        },
      },
    },
  },
  contributes: {
    namespaceKinds: [
      {
        name: "theme-kind",
        level: "enforced",
      },
    ],
    environmentPresets: [
      {
        name: "theme-preset",
      },
    ],
    environments: [
      {
        name: "theme-data",
        title: "the theme's settings",
        preset: "data",
      },
    ],
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
    "theme/config/settings.json": "{}\n",
    "other/package.json": JSON.stringify({ name: "other", type: "module" }),
    "other/config/settings.json": "{}\n",
  });

  return createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({
      extensions: [themeExtension],
      ...input,
      workspaces: {
        globs: {
          theme: { name: "theme" },
          other: { name: "other" },
        },
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

  test("resolve a workspace environment selecting a preset only the root activates", async () => {
    const config = loadProject({
      input: {
        preset: "library",
      },
      metafile: {
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

  test("register a scope-only environment entry under the preset it names, in that scope alone", async () => {
    const config = loadProject({
      metafile: {
        preset: "library",
      },
    });

    const registered = await listRegistered(config);

    expect(registered).toContainEqual(["theme", "theme-data", "data"]);

    expect(registered.filter(([, name]) => name === "theme-data")).toHaveLength(
      1,
    );

    const context = await config.resolve("structure.context");

    const { namespaces } = await context.discover();

    expect(namespaces.theme?.["theme-data"]?.active).toBe(true);

    expect(namespaces.other?.["theme-data"]).toBeUndefined();

    expect(namespaces["."]?.["theme-data"]).toBeUndefined();
  });
});
