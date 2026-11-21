import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import {
  createScopeTree,
  discoverWorkspaces,
  getEnvironmentId,
} from "#batiment/scopes/index";
import { createFilesystem } from "#foundation/filesystem/index";
import { createProjectConfig } from "#project/config/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

const placeholder = "{dir}";

const packageJson = JSON.stringify({ name: "app", type: "module" });

async function resolveScopes(files: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": packageJson,
    "engrenage.config.ts": `export default { workspaces: { "extensions/*": { name: "@x/${placeholder}" } } };\n`,
    ...files,
  });

  return (await loadConfig(project.root)).resolve("scopes");
}

function resolvePresetScopes({
  input,
  preset,
  files,
}: {
  input: Readonly<Record<string, unknown>>;
  preset: Readonly<Record<string, unknown>>;
  files: Record<string, string>;
}) {
  const fixture = {
    name: "scopes-fixture",
    contributes: {
      presets: [
        {
          name: "fixture",
          traits: [],
          load() {
            return Promise.resolve(preset);
          },
        },
      ],
    },
  };

  return createProjectConfig({
    root: createTemporaryProject({ "package.json": packageJson, ...files })
      .root,
    raw: withSourceRuntime({
      extensions: [fixture],
      preset: "fixture",
      ...input,
    }),
    configFile: undefined,
  }).resolve("scopes");
}

function summarize(
  diagnostics: readonly { readonly code: string; readonly path?: string }[],
) {
  return diagnostics.map(({ code, path }) => {
    return { code, path };
  });
}

describe("getEnvironmentId", () => {
  test("is the name at the root and prefixed by the scope elsewhere", () => {
    expect(getEnvironmentId(".", "src")).toBe("src");

    expect(getEnvironmentId("theme", "src")).toBe("theme/src");
  });
});

describe("createScopeTree", () => {
  test("reports workspaces inside an environment or another workspace", () => {
    const { scopes, diagnostics } = createScopeTree({
      environments: [
        {
          name: "src",
          kind: "code",
          dirs: ["src"],
        },
      ],
      workspaces: [
        {
          dir: "src/theme",
        },
        {
          dir: "extensions/a",
        },
        {
          dir: "extensions/a/b",
        },
      ],
      missing: [],
    });

    expect(
      diagnostics.map(({ code, path }) => {
        return { code, path };
      }),
    ).toEqual([
      { code: "workspace-in-environment", path: "src/theme" },
      { code: "nested-workspace", path: "extensions/a/b" },
    ]);

    expect(keys(scopes).sort()).toEqual([".", "extensions/a", "src/theme"]);

    expect(scopes["."]?.environments).toEqual([
      {
        id: "src",
        scope: ".",
        name: "src",
        kind: "code",
        dirs: ["src"],
      },
    ]);
  });
});

describe("discoverWorkspaces", () => {
  test("reads the purpose and returns the other keys raw", async () => {
    const project = createTemporaryProject({
      "extensions/a/.workspace.json": JSON.stringify({
        purpose: "x",
        name: "@x/a",
      }),
    });

    const { workspaces, diagnostics } = await discoverWorkspaces({
      filesystem: createFilesystem(project.root),
      ignored: [],
    });

    expect(workspaces).toEqual([
      {
        dir: "extensions/a",
        file: "extensions/a/.workspace.json",
        purpose: "x",
        remainder: { name: "@x/a" },
      },
    ]);

    expect(diagnostics).toEqual([]);
  });
});

describe("scopes", () => {
  test("reports a glob match without metafile and keeps an unmatched metafile", async () => {
    const { scopes, diagnostics } = await resolveScopes({
      "extensions/b/src/index.ts": "",
      "tools/c/.workspace.json": "{}",
    });

    expect(summarize(diagnostics)).toEqual([
      { code: "missing-workspace", path: "extensions/b" },
    ]);

    expect(keys(scopes).sort()).toEqual([".", "tools/c"]);
  });

  test("reports a workspace inside another", async () => {
    const { diagnostics } = await resolveScopes({
      "extensions/a/.workspace.json": "{}",
      "extensions/a/inner/.workspace.json": "{}",
    });

    expect(summarize(diagnostics)).toEqual([
      { code: "nested-workspace", path: "extensions/a/inner" },
    ]);
  });

  test("reports an unreadable metafile, whose directory a glob then misses", async () => {
    const { diagnostics } = await resolveScopes({
      "extensions/d/.workspace.json": "[",
    });

    expect(summarize(diagnostics)).toEqual([
      { code: "unreadable-metafile", path: "extensions/d" },
      { code: "missing-workspace", path: "extensions/d" },
    ]);
  });

  test("takes the purpose of a metafile under a glob without one", async () => {
    const { scopes, diagnostics } = await resolveScopes({
      "extensions/a/.workspace.json": JSON.stringify({ purpose: "theme" }),
    });

    expect(diagnostics).toEqual([]);

    expect(scopes["extensions/a"]?.purpose).toBe("theme");
  });

  test("reports a purpose set by both the config and the metafile", async () => {
    const { scopes, diagnostics } = await resolvePresetScopes({
      input: {
        workspaces: {
          "extensions/*": { name: `@x/${placeholder}`, purpose: "config" },
        },
      },
      preset: {},
      files: {
        "extensions/a/.workspace.json": JSON.stringify({ purpose: "theme" }),
      },
    });

    expect(diagnostics).toEqual([
      {
        severity: "error",
        code: "config-metafile-conflict",
        message: "extensions/a sets purpose in both workspaces.extensions/*.purpose and extensions/a/.workspace.json; keeping the value of extensions/a/.workspace.json",
        path: "extensions/a",
        files: ["extensions/a/.workspace.json"],
        config: {
          key: "workspaces",
          path: "workspaces.extensions/*.purpose",
          origin: { layer: "input" },
        },
      },
    ]);

    expect(scopes["extensions/a"]?.purpose).toBe("theme");
  });

  test("overrides a preset's purpose without a diagnostic", async () => {
    const { scopes, diagnostics } = await resolvePresetScopes({
      input: {},
      preset: {
        workspaces: {
          "extensions/*": { name: `@x/${placeholder}`, purpose: "preset" },
        },
      },
      files: {
        "extensions/a/.workspace.json": JSON.stringify({ purpose: "theme" }),
        "extensions/b/.workspace.json": "{}",
      },
    });

    expect(diagnostics).toEqual([]);

    expect(scopes["extensions/a"]?.purpose).toBe("theme");

    expect(scopes["extensions/b"]?.purpose).toBe("preset");
  });
});
