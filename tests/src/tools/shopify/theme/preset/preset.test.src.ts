import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { readEnvironmentLanguages } from "#project/environments/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { fillBlocks } from "#tests/utils/fillBlocks";
import { mockCwd } from "#tests/utils/mockCwd";
import type { LoadedConfig } from "#project/config/index";

interface ThemeWorkspaceOptions {
  readonly root?: string;
  readonly preset?: string;
}

const themeNamespaces = [
  "layout",
  "templates",
  "sections",
  "snippets",
  "blocks",
  "locales",
  "config",
  "assets",
];

function createThemeWorkspace({ root, preset }: ThemeWorkspaceOptions) {
  const devDependencies = {
    "@shopify/cli": "*",
    "@shopify/prettier-plugin-liquid": "*",
  };

  const project = createTemporaryProject({
    "engrenage.config.ts": `export default ${JSON.stringify({
      ...(root === undefined ? {} : { preset: root }),
      workspaces: {
        theme: { name: "theme" },
      },
    })};\n`,
    "package.json": JSON.stringify({
      name: "root",
      type: "module",
      devDependencies,
    }),
    ".gitignore": "# @ignore project\n# @end\n",
    "src/index.ts": "export {};\n",
    "layout/theme.liquid": "{{ content_for_layout }}\n",
    "sections/a.liquid": "<div>{{ a }}</div>\n",
    "theme/package.json": JSON.stringify({
      name: "theme",
      type: "module",
      devDependencies,
    }),
    "theme/.workspace.json": JSON.stringify(
      preset === undefined ? {} : { preset },
    ),
    "theme/layout/theme.liquid": "{{ content_for_layout }}\n",
    "theme/templates/index.json": "{}\n",
    "theme/sections/a.liquid": "<div>{{ a }}</div>\n",
    "theme/sections/header-group.json": "{}\n",
    "theme/snippets/a.liquid": "<p></p>\n",
    "theme/blocks/a.liquid": "<p></p>\n",
    "theme/locales/en.default.json": "{}\n",
    "theme/config/settings_schema.json": "[]\n",
    "theme/assets/base.css": "body {}\n",
  });

  mockCwd(project.root);

  return project;
}

function listNames(entries: readonly { readonly name: string }[]) {
  return entries.map(({ name }) => name);
}

async function discover(config: LoadedConfig) {
  const context = await config.resolve("structure.context");

  return context.discover();
}

async function listRegistered(config: LoadedConfig) {
  const { environments } = await discover(config);

  return environments.registered.map(({ scope, registration, preset }) => {
    return [scope, registration.name, preset.name];
  });
}

describe("shopify-theme preset", () => {
  test("gives a workspace selecting the preset the theme kind, namespaces and Liquid environment", async () => {
    const config = await loadConfig(
      createThemeWorkspace({ preset: "shopify-theme" }).root,
    );

    const theme = await config.context.scope("theme");

    expect(listNames(await theme.resolve("namespaceKinds"))).toContain(
      "liquid-theme",
    );

    const { namespaces } = await discover(config);

    expect(
      themeNamespaces.map((name) => {
        return [name, namespaces.theme?.[name]?.kind.name];
      }),
    ).toEqual([
      ["layout", "liquid-theme"],
      ["templates", "liquid-theme"],
      ["sections", "liquid-theme"],
      ["snippets", "liquid-theme"],
      ["blocks", "liquid-theme"],
      ["locales", "data"],
      ["config", "data"],
      ["assets", "static"],
    ]);

    const languages = await readEnvironmentLanguages(theme, "sections");

    expect(listNames(languages)).toEqual(["liquid", "json"]);

    expect(await listRegistered(config)).toContainEqual([
      "theme",
      "sections",
      "liquid-theme",
    ]);

    const files = await config.resolve("files");

    expect(files.private.filter((glob) => glob.endsWith(".liquid"))).toEqual(
      [],
    );
  });

  test("gives a workspace without a preset none of the theme's structure the root selects", async () => {
    const config = await loadConfig(
      createThemeWorkspace({ root: "shopify-theme" }).root,
    );

    const theme = await config.context.scope("theme");

    expect(listNames(await theme.resolve("namespaceKinds"))).not.toContain(
      "liquid-theme",
    );

    const { namespaces } = await discover(config);

    expect(namespaces["."]?.sections).toBeDefined();

    for (const name of themeNamespaces) {
      expect(namespaces.theme?.[name]).toBeUndefined();
    }

    expect(await listRegistered(config)).not.toContainEqual([
      "theme",
      "sections",
      "liquid-theme",
    ]);
  });

  test("ignores Vite's output in a workspace selecting the preset alone", async () => {
    const project = createThemeWorkspace({
      root: "shopify-app",
      preset: "shopify-theme",
    });

    const ignores = await fillBlocks(
      await loadConfig(project.root),
      ".gitignore",
    );

    expect(ignores).toContain("/theme/assets/d-*");
    expect(ignores).toContain("/theme/assets/.vite/**");
    expect(ignores).not.toContain("\n/assets/d-*");
    expect(ignores).not.toContain("\n/assets/.vite/**");
  });
});
