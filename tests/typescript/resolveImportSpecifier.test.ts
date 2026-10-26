import { describe, expect, test } from "vitest";

import { resolveImportSpecifier } from "@auaust/engrenage/typescript";

const imports = {
  "#config/*": "./config/*.ts",
  "#eslint/*": "./src/eslint/*.ts",
};

describe("resolveImportSpecifier", () => {
  test("maps a file back to its subpath import", () => {
    expect(resolveImportSpecifier(imports, "config/eslint/baseRules.ts")).toBe(
      "#config/eslint/baseRules",
    );
  });

  test("follows the default condition of conditional targets", () => {
    expect(
      resolveImportSpecifier(
        {
          "#types/*": {
            types: "./types/*.d.ts",
            default: "./src/types/*.ts",
          },
        },
        "src/types/File.ts",
      ),
    ).toBe("#types/File");
  });

  test("rejects a file no subpath import covers", () => {
    expect(() => {
      return resolveImportSpecifier(imports, "bin/engrenage/index.ts");
    }).toThrow("found 0");
  });
});
