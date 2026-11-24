import { describe, expect, test } from "vitest";

import { createImportResolver } from "#project/structure/utils/createImportResolver";
import type { ResolvedAliases } from "#batiment/structure/index";

function aliasesOf(...source: ResolvedAliases["src"]): ResolvedAliases {
  return {
    enabled: true,
    global: [],
    src: source,
  };
}

const resolveImport = createImportResolver({
  root: "/project",
  scopes: {
    ".": {
      aliases: aliasesOf({
        key: "#project/*",
        target: "./src/project/*.ts",
        source: "src entry src/project",
      }),
      packageName: "library",
    },
  },
});

const from = "src/project/feature/utils/own.ts";

describe("createImportResolver", () => {
  test("classifies alias, relative, self and package specifiers", () => {
    expect(resolveImport("#project/feature/index", from)).toMatchObject({
      kind: "alias",
      path: "src/project/feature/index.ts",
    });

    expect(resolveImport("../x", from)).toEqual({
      kind: "relative",
      path: "src/project/feature/x",
    });

    expect(resolveImport("library/eslint", from)).toEqual({
      kind: "self",
      subpath: "./eslint",
    });

    expect(resolveImport("node:fs", from)).toEqual({
      kind: "package",
      name: "node:fs",
    });
  });

  test("resolves each specifier from its importer's scope", () => {
    const ui = aliasesOf({
      key: "#ui",
      target: "./src/ui/index.ts",
      source: "src entry src/ui",
    });

    const resolveScoped = createImportResolver({
      root: "/project",
      scopes: {
        ".": { aliases: ui, packageName: "@x/root" },
        "theme": { aliases: ui, packageName: "@x/theme" },
      },
    });

    expect(resolveScoped("#ui", "theme/src/a.ts")).toMatchObject({
      kind: "alias",
      path: "theme/src/ui/index.ts",
    });

    expect(resolveScoped("#ui", "/project/src/a.ts")).toMatchObject({
      kind: "alias",
      path: "src/ui/index.ts",
    });

    expect(resolveScoped("@x/theme/b", "theme/src/a.ts")).toEqual({
      kind: "self",
      subpath: "./b",
    });

    expect(resolveScoped("@x/theme/b", "src/a.ts")).toEqual({
      kind: "package",
      name: "@x/theme",
    });
  });
});
