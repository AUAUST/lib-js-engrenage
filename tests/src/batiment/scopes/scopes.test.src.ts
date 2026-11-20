import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { createScopeTree, getEnvironmentId } from "#batiment/scopes/index";

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
