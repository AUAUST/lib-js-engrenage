import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { discoverWorkspaces } from "#batiment/context/operations/discoverWorkspaces";
import {
  createScopeTree,
  getNamespaceId,
  listNamespaces,
} from "#batiment/scopes/index";
import { reconcileEnvironmentDirs } from "#batiment/scopes/utils/reconcileEnvironmentDirs";
import { resolveNamespaceGrants } from "#batiment/structure/index";
import { createFilesystem } from "#foundation/filesystem/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createPresetConfig } from "#tests/utils/createPresetConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

const placeholder = "{dir}";

const packageJson = JSON.stringify({ name: "app", type: "module" });

async function resolveScopes(files: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": packageJson,
    "engrenage.config.ts": `export default { workspaces: { globs: { "extensions/*": { name: "@x/${placeholder}" } } } };\n`,
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
  return createPresetConfig({
    root: createTemporaryProject({ "package.json": packageJson, ...files })
      .root,
    preset,
    input: withSourceRuntime(input),
  }).resolve("scopes");
}

async function resolveGrants(files: Record<string, string>) {
  const tree = await resolveScopes(files);

  return {
    diagnostics: summarize(tree.diagnostics),
    grants: resolveNamespaceGrants(false, listNamespaces(tree)),
  };
}

function summarize(
  diagnostics: readonly { readonly code: string; readonly path?: string }[],
) {
  return diagnostics.map(({ code, path }) => {
    return { code, path };
  });
}

describe("getNamespaceId", () => {
  test("is the name at the root and prefixed by the scope elsewhere", () => {
    expect(getNamespaceId(".", "src")).toBe("src");

    expect(getNamespaceId("theme", "src")).toBe("theme/src");
  });
});

describe("createScopeTree", () => {
  test("reports workspaces inside an environment or another workspace", () => {
    const kind = {
      name: "code",
      level: "enforced",
      structure: "domains",
    } as const;

    const { scopes, diagnostics } = createScopeTree({
      namespaces: [
        {
          name: "src",
          title: "the source",
          kind,
          dirs: ["src"],
        },
      ],
      workspaces: [
        {
          dir: "src/theme",
          namespaces: [],
        },
        {
          dir: "extensions/a",
          namespaces: [],
        },
        {
          dir: "extensions/a/b",
          namespaces: [],
        },
      ],
      missing: [],
      unmatched: [],
    });

    expect(
      diagnostics.map(({ code, path }) => {
        return { code, path };
      }),
    ).toEqual([
      { code: "workspace-in-namespace", path: "src/theme" },
      { code: "nested-workspace", path: "extensions/a/b" },
    ]);

    expect(keys(scopes).sort()).toEqual([".", "extensions/a", "src/theme"]);

    expect(scopes["."]?.namespaces).toEqual([
      {
        id: "src",
        scope: ".",
        name: "src",
        title: "the source",
        kind,
        dirs: ["src"],
      },
    ]);
  });
});

describe("reconcileEnvironmentDirs", () => {
  test("drops a default dir another environment owns or names, unless explicit", () => {
    const claims = {
      a: {
        owns: ["shared"],
        dirs: undefined,
        named: [],
      },
      b: {
        owns: [],
        dirs: undefined,
        named: ["named"],
      },
    };

    expect(
      reconcileEnvironmentDirs("c", ["shared", "named", "own"], claims),
    ).toEqual(["own"]);

    expect(
      reconcileEnvironmentDirs("c", ["shared"], {
        ...claims,
        c: {
          owns: [],
          dirs: ["shared"],
          named: [],
        },
      }),
    ).toEqual(["shared"]);
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

  test("reports an unmatched metafile under extra report, leaving it no scope", async () => {
    const { scopes, diagnostics } = await resolvePresetScopes({
      input: {
        workspaces: {
          globs: {
            "extensions/*": { name: `@x/${placeholder}` },
          },
          extra: "report",
        },
      },
      preset: {},
      files: {
        "extensions/a/.workspace.json": "{}",
        "tools/c/.workspace.json": "{}",
      },
    });

    expect(diagnostics).toEqual([
      {
        severity: "error",
        code: "unmatched-workspace",
        message: 'tools/c/.workspace.json lies in a directory no workspaces.globs entry matches, which workspaces.extra "report" refuses; ignoring it',
        path: "tools/c",
        files: ["tools/c/.workspace.json"],
      },
    ]);

    expect(keys(scopes).sort()).toEqual([".", "extensions/a"]);
  });

  test("places a workspace's top-level namespace from the registration it inherits, without a `.namespace.json`", async () => {
    const { scopes, diagnostics } = await resolveScopes({
      "theme/.workspace.json": "{}",
      "theme/src/a.ts": "",
    });

    expect(diagnostics).toEqual([]);

    expect(scopes.theme?.namespaces).toEqual([
      expect.objectContaining({
        id: "theme/src",
        scope: "theme",
        name: "src",
        title: "the theme/src namespace's files",
        kind: expect.objectContaining({ name: "src" }),
        dirs: ["theme/src"],
      }),
    ]);
  });

  test("reports a workspace metafile naming an unknown kind, keeping its placement's kind", async () => {
    const { scopes, diagnostics } = await resolveScopes({
      "theme/.workspace.json": "{}",
      "theme/src/.namespace.json": JSON.stringify({ kind: "unknown" }),
      "theme/src/a.ts": "",
    });

    expect(summarize(diagnostics)).toEqual([
      { code: "unknown-namespace-kind", path: "theme/src" },
    ]);

    expect(
      scopes.theme?.namespaces.map(({ name, kind }) => [name, kind.name]),
    ).toEqual([["src", "src"]]);
  });

  test("keeps an environment metafile beside a namespace metafile", async () => {
    const { diagnostics } = await resolveScopes({
      "src/.environment.json": '{ "environment": "src" }',
      "src/.namespace.json": "{}",
      "src/a.ts": "",
    });

    expect(diagnostics).toEqual([]);
  });

  test("reports a root kind set by both the config and the metafile, keeping the metafile's", async () => {
    const { scopes, diagnostics } = await resolvePresetScopes({
      input: {
        data: { kind: "data" },
      },
      preset: {},
      files: {
        "data/.namespace.json": JSON.stringify({
          kind: "static",
          purpose: "Static files.",
        }),
        "data/a.json": "{}",
      },
    });

    expect(summarize(diagnostics)).toEqual([
      { code: "config-metafile-conflict", path: "data" },
    ]);

    expect(
      scopes["."]?.namespaces.find(({ name }) => name === "data")?.kind.name,
    ).toBe("static");
  });

  test("keeps an unstructured namespace's metafile purpose and warns on one without", async () => {
    const { scopes, diagnostics } = await resolveScopes({
      "data/.namespace.json": JSON.stringify({ purpose: "Shipped files." }),
      "data/a.json": "{}",
      "public/a.png": "",
    });

    const namespaces = scopes["."]?.namespaces ?? [];

    expect(namespaces.find(({ name }) => name === "data")?.purpose).toBe(
      "Shipped files.",
    );

    expect(diagnostics).toEqual([
      expect.objectContaining({
        severity: "warning",
        code: "missing-purpose",
        namespace: "static",
        path: "public",
      }),
    ]);
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
          globs: {
            "extensions/*": { name: `@x/${placeholder}`, purpose: "config" },
          },
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
        message: "extensions/a sets purpose in both workspaces.globs.extensions/*.purpose and extensions/a/.workspace.json; keeping the value of extensions/a/.workspace.json",
        path: "extensions/a",
        files: ["extensions/a/.workspace.json"],
        config: {
          key: "workspaces.options",
          path: "workspaces.globs.extensions/*.purpose",
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
          globs: {
            "extensions/*": { name: `@x/${placeholder}`, purpose: "preset" },
          },
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

  test("grants a root namespace's opted-in import beside its kind's", async () => {
    const { diagnostics, grants } = await resolveGrants({
      "src/.namespace.json": JSON.stringify({
        imports: { scripts: "surface" },
      }),
      "src/a.ts": "",
      "scripts/a.ts": "",
      "bin/a.ts": "",
    });

    expect(diagnostics).toEqual([]);

    expect(grants.surface.src).toEqual(["scripts"]);

    expect(grants.namespaces.src).toContain("bin");

    expect(grants.namespaces.src).not.toContain("scripts");
  });

  test("reports and ignores an opt-in into a sealed namespace", async () => {
    const { diagnostics, grants } = await resolveGrants({
      "src/.namespace.json": JSON.stringify({
        imports: { static: "whole" },
      }),
      "src/a.ts": "",
      "public/a.png": "",
      "public/.namespace.json": JSON.stringify({ purpose: "Static assets." }),
    });

    expect(diagnostics).toEqual([
      { code: "sealed-import-target", path: "src" },
    ]);

    expect(grants.namespaces.src).toContain("static");
  });

  test("grants a workspace namespace an opt-in by name within its scope", async () => {
    const files = {
      "theme/.workspace.json": "{}",
      "theme/src/a.ts": "",
      "theme/tooling/.namespace.json": "{}",
      "theme/tooling/a.ts": "",
    };

    const byName = await resolveGrants({
      ...files,
      "theme/src/.namespace.json": JSON.stringify({
        imports: { tooling: "whole" },
      }),
    });

    expect(byName.diagnostics).toEqual([]);

    expect(byName.grants.namespaces["theme/src"]).not.toContain(
      "theme/tooling",
    );

    expect(byName.grants.surface["theme/src"]).toBeUndefined();

    const byId = await resolveGrants({
      ...files,
      "theme/src/.namespace.json": JSON.stringify({
        imports: { "theme/tooling": "whole" },
      }),
    });

    expect(byId.diagnostics).toEqual([
      { code: "unknown-import-target", path: "theme/src" },
    ]);

    expect(byId.grants.namespaces["theme/src"]).toContain("theme/tooling");
  });
});
