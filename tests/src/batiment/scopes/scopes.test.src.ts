import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import {
  createScopeTree,
  discoverWorkspaces,
  getEnvironmentId,
} from "#batiment/scopes/index";
import { createFilesystem } from "#foundation/filesystem/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

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
      workspaces: ["src/theme", "extensions/a", "extensions/a/b"],
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
});
