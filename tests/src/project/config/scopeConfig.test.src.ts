import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import type { RawConfig } from "#project/config/types/RawConfig";

const installed = {
  name: "installed-fixture",
  when: { installed: "theme-only" },
};

function loadProject({
  input = {},
  metafile = {},
  dependencies = {},
}: {
  input?: RawConfig;
  metafile?: RawConfig;
  dependencies?: Readonly<Record<string, string>>;
}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "root", type: "module" }),
    "theme/package.json": JSON.stringify({
      name: "theme",
      type: "module",
      dependencies,
    }),
    "theme/.workspace.json": JSON.stringify(metafile),
    "theme/src/index.ts": "export {};\n",
  });

  return createProjectConfig({
    root: project.root,
    raw: {
      extensions: [installed],
      ...input,
      workspaces: {
        theme: {
          name: "theme",
          ...(input.workspaces as Readonly<Record<string, object>> | undefined)
            ?.theme,
        },
      },
    },
    configFile: undefined,
  });
}

describe("workspace child resolvers", () => {
  test("evaluates when.installed against the workspace's own package.json", async () => {
    const config = loadProject({
      dependencies: { "theme-only": "1.0.0" },
    });

    const child = await config.context.scope("theme");

    await expect(
      config.context.registry.isActive(installed.name, child),
    ).resolves.toBe(true);

    await expect(
      config.context.registry.isActive(installed.name, config),
    ).resolves.toBe(false);
  });

  test("puts the .workspace.json remainder above the glob entry", async () => {
    const config = loadProject({
      input: {
        workspaces: {
          theme: {
            traits: { enable: ["published"] },
          },
        },
      },
      metafile: {
        traits: { enable: [] },
      },
    });

    const child = await config.context.scope("theme");

    await expect(child.resolve("traits")).resolves.toEqual({
      published: false,
    });

    await expect(
      child.origin("traits.adjustments", "traits.enable"),
    ).resolves.toEqual({ layer: "input" });
  });

  test("names the layer an invalid input value comes from", async () => {
    const config = loadProject({
      input: {
        workspaces: {
          theme: {
            traits: { enable: ["unknown-trait"] },
          },
        },
      },
    });

    const child = await config.context.scope("theme");

    await expect(child.resolve("traits")).rejects.toThrow(
      'set by workspaces "theme"',
    );
  });

  test("refuses a project-only key in .workspace.json", async () => {
    const config = loadProject({
      metafile: {
        git: {},
      },
    });

    await expect(config.context.scope("theme")).rejects.toThrow(
      'Config key "git" is project-only',
    );
  });

  test("refuses a project-only key in a glob entry", async () => {
    const config = loadProject({
      input: {
        workspaces: {
          theme: {
            vscode: {},
          },
        },
      },
    });

    await expect(config.context.scope("theme")).rejects.toThrow(
      'Config key "vscode" is project-only',
    );
  });

  test("inherits inherited keys from the root and resolves the rest from the workspace", async () => {
    const config = loadProject({
      input: {
        typescript: { verbatimModuleSyntax: false },
        traits: { enable: ["published"] },
      },
      metafile: {
        preset: "app",
      },
    });

    const child = await config.context.scope("theme");

    await expect(child.resolve("typescript.options")).resolves.toMatchObject({
      verbatimModuleSyntax: false,
    });

    await expect(
      child.origin("typescript.options", "typescript.verbatimModuleSyntax"),
    ).resolves.toEqual({ layer: "default", name: "root config" });

    await expect(child.resolve("traits")).resolves.toEqual({
      published: false,
    });

    await expect(config.resolve("traits")).resolves.toEqual({
      published: true,
    });
  });

  test("keeps the root's other values of an inherited key the workspace sets in part", async () => {
    const config = loadProject({
      input: {
        typescript: { verbatimModuleSyntax: false },
      },
      metafile: {
        typescript: {
          tsconfig: { unmanaged: ["x"] },
        },
      },
    });

    const child = await config.context.scope("theme");

    await expect(child.resolve("typescript.options")).resolves.toMatchObject({
      verbatimModuleSyntax: false,
    });
  });

  test("resolves project keys through the root", async () => {
    const config = loadProject({});

    const child = await config.context.scope("theme");

    await expect(child.resolve("scopes")).resolves.toBe(
      await config.resolve("scopes"),
    );
  });
});
