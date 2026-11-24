import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createImportResolver } from "#project/structure/utils/createImportResolver";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import type { Alias } from "#batiment/structure/index";

function aliasesOf(...aliases: Alias[]): readonly Alias[] {
  return aliases;
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

  test("resolves the aliases a workspace's package.json imports declares by hand", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": [
        "export default {",
        '  environments: { src: { execution: { globals: "node", syntax: 24 } } },',
        '  workspaces: { globs: { "extensions/*": { name: "@project/{dir}" } } },',
        "};",
        "",
      ].join("\n"),
      "package.json": '{ "name": "@project/root", "type": "module" }',
      "tsconfig.json": "{}",
      "src/index.ts": "",
      "extensions/home/.workspace.json": "{}",
      "extensions/home/package.json": JSON.stringify({
        name: "@project/home",
        type: "module",
        imports: {
          "#self/*": {
            types: ["./src/*.ts", "./src/*.tsx"],
            default: "./src/*",
          },
          "#node/*": {
            node: null,
            default: "./src/node/*.ts",
          },
          "#none": null,
        },
      }),
      "extensions/home/src/index.ts": "",
    });

    const config = await loadConfig(project.root);

    const resolveScoped = await config.resolve("importResolver");

    expect(
      resolveScoped("#self/components/Card", "extensions/home/src/index.ts"),
    ).toMatchObject({
      kind: "alias",
      path: "extensions/home/src/components/Card.ts",
    });

    expect(
      resolveScoped("#node/fs", "extensions/home/src/index.ts"),
    ).toMatchObject({
      kind: "alias",
      path: "extensions/home/src/node/fs.ts",
    });

    expect(
      resolveScoped("#none", "extensions/home/src/index.ts"),
    ).toBeUndefined();

    expect(resolveScoped("#self/a", "src/index.ts")).toBeUndefined();
  });
});
