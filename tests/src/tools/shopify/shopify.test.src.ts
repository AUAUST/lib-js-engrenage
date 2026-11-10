import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { syncPrettierignoreFile } from "#tools/prettier/setup/syncPrettierignoreFile";

import sync from "#bin/engrenage/actions/sync";

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
    "extensions/a/package.json": JSON.stringify({}),
    "extensions/a/src/index.tsx": "",
    "extensions/b/package.json": JSON.stringify({}),
    "extensions/b/src/index.tsx": "",
  });

  mockCwd(project.root);

  return project;
}

async function syncPrettierignore(project: ReturnType<typeof createApp>) {
  const config = await loadConfig(project.root);

  await syncPrettierignoreFile(config);

  await config.context.filesystem.flush();

  return project.read(".prettierignore");
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("shopify-app", () => {
  test("syncs the extension workspaces with Preact and Polaris types", async () => {
    const project = createApp();

    await sync(["workspaces", "pnpm"], {
      check: false,
      values: {},
    });

    expect(project.read("pnpm-workspace.yaml")).toContain(
      "packages:\n  - extensions/*\n",
    );

    expect(JSON.parse(project.read("extensions/a/package.json")).name).toBe(
      "a",
    );

    expect(
      JSON.parse(project.read("extensions/a/tsconfig.json")).compilerOptions,
    ).toEqual({
      types: ["@shopify/polaris-types"],
      jsx: "react-jsx",
      jsxImportSource: "preact",
    });
  });

  test("keeps the preset beside the paths a config sets", async () => {
    const project = createApp({
      config: `export default {
  preset: "shopify-app",
  workspaces: {
    "extensions/*": {
      name: "@scope/${placeholder}",
      tsconfig: { compilerOptions: { strict: true } },
    },
  },
};
`,
    });

    await sync(["workspaces", "pnpm"], {
      check: false,
      values: {},
    });

    expect(JSON.parse(project.read("extensions/a/package.json")).name).toBe(
      "@scope/a",
    );

    expect(
      JSON.parse(project.read("extensions/a/tsconfig.json")).compilerOptions,
    ).toEqual({
      types: ["@shopify/polaris-types"],
      jsx: "react-jsx",
      jsxImportSource: "preact",
      strict: true,
    });
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
