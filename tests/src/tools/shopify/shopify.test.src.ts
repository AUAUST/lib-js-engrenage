import { afterEach, describe, expect, test, vi } from "vitest";

import { getDirectoryEnvironment } from "#batiment/environments/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";

import engrenage from "#bin/engrenage/index";

const hostIgnores = [
  "/shopify.app*.toml",
  "/shopify.web.toml",
  "/extensions/*/shopify.extension.toml",
  "/extensions/*/locales/**",
];

const placeholder = "{dir}";

interface AppOptions {
  readonly config?: string;
  readonly cli?: boolean;
  readonly app?: boolean;
}

function createApp({
  config = 'export default { preset: "shopify-app" };\n',
  cli = true,
  app = true,
}: AppOptions = {}) {
  const project = createTemporaryProject({
    "engrenage.config.ts": config,
    "package.json": JSON.stringify({
      name: "app",
      type: "module",
      devDependencies: {
        prettier: "*",
        ...(cli ? { "@shopify/cli": "*" } : {}),
      },
    }),
    "tsconfig.json": "{}",
    ...(app ? { "shopify.app.toml": "" } : {}),
    ".prettierignore": "# @ignore project\n# @end\n",
    "extensions/a/.workspace.json": "{}",
    "extensions/a/package.json": JSON.stringify({}),
    "extensions/a/src/index.tsx": "",
    "extensions/b/.workspace.json": "{}",
    "extensions/b/package.json": JSON.stringify({}),
    "extensions/b/src/index.tsx": "",
  });

  mockCwd(project.root);

  return project;
}

async function syncPrettierignore(project: ReturnType<typeof createApp>) {
  const config = await loadConfig(project.root);

  await runSync(config, { names: ["blocks"] });

  await config.context.filesystem.flush();

  return project.read(".prettierignore");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("shopify-app", () => {
  test("syncs the extension workspaces", async () => {
    const project = createApp();

    await runDefinition(engrenage, "sync", "workspaces", "pnpm");

    expect(project.read("pnpm-workspace.yaml")).toContain(
      "packages:\n  - extensions/*\n",
    );

    expect(JSON.parse(project.read("extensions/a/package.json")).name).toBe(
      "a",
    );
  });

  test("places each extension's src with its own shopify-extensions instance", async () => {
    const project = createApp();

    const config = await loadConfig(project.root);

    const context = await config.resolve("structure.context");

    const { environments, diagnostics } = await context.discover();

    expect(diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "environment-placement-conflict" }),
    );

    expect(
      getDirectoryEnvironment(environments.placements, "extensions/a/src"),
    ).toBe("shopify-extensions");

    expect(
      environments.instances
        .filter(({ dirs }) => dirs.includes("extensions/a/src"))
        .map(({ environment, scope, active }) => {
          return {
            environment,
            scope,
            active,
          };
        }),
    ).toEqual([
      {
        environment: "shopify-extensions",
        scope: "extensions/a",
        active: true,
      },
    ]);
  });

  test("writes each extension's tsconfig with Preact, Polaris and Shopify CLI types beside a config's options and appended types", async () => {
    const project = createApp({
      config: `export default {
  preset: "shopify-app",
  workspaces: { globs: {
    "extensions/*": {
      environments: {
        "shopify-extensions": {
          execution: { syntax: "2026-10" },
          tsconfig: {
            compilerOptions: { strict: true },
            types: { append: "vite/client" },
            include: { append: "../../src/env.d.ts" },
          },
        },
      },
    },
  } },
  typescript: { tsconfig: { extends: false } },
};
`,
    });

    const config = await loadConfig(project.root);

    await runSync(config, { names: ["tsconfig", "workspaces"] });

    await config.context.filesystem.flush();

    const tsconfig = JSON.parse(project.read("extensions/a/tsconfig.json"));

    expect(tsconfig.compilerOptions).toMatchObject({
      jsx: "react-jsx",
      jsxImportSource: "preact",
      strict: true,
    });

    expect(tsconfig.compilerOptions.types).toEqual([
      "@shopify/polaris-types",
      "vite/client",
    ]);

    expect(tsconfig.include).toEqual(
      expect.arrayContaining([
        "src/**/*.tsx",
        "shopify.d.ts",
        "../../src/env.d.ts",
      ]),
    );
  });

  test("keeps the preset beside the paths a config sets", async () => {
    const project = createApp({
      config: `export default {
  preset: "shopify-app",
  workspaces: { globs: {
    "extensions/*": {
      name: "@scope/${placeholder}",
    },
  } },
};
`,
    });

    await runDefinition(engrenage, "sync", "workspaces", "pnpm");

    expect(JSON.parse(project.read("extensions/a/package.json")).name).toBe(
      "@scope/a",
    );
  });

  test("ignores the host files of an app", async () => {
    const ignores = await syncPrettierignore(createApp());

    for (const ignore of hostIgnores) {
      expect(ignores).toContain(`${ignore}\n`);
    }
  });

  test("ignores no host file without an app configuration", async () => {
    const ignores = await syncPrettierignore(createApp({ app: false }));

    for (const ignore of hostIgnores) {
      expect(ignores).not.toContain(ignore);
    }
  });

  test("refuses the preset without the Shopify CLI", async () => {
    const project = createApp({ cli: false });

    const config = await loadConfig(project.root);

    await expect(config.resolve("preset")).rejects.toThrow(
      /tools\/shopify.*inactive.*install @shopify\/cli/,
    );
  });
});
