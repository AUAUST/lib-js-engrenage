import { describe, expect, test } from "vitest";

import { createImportResolver } from "#project/structure/utils/createImportResolver";

const resolveImport = createImportResolver({
  root: "/project",
  aliases: {
    enabled: true,
    global: [],
    src: [
      {
        key: "#project/*",
        target: "./src/project/*.ts",
        source: "src entry src/project",
      },
    ],
  },
  packageName: "library",
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
});
