import { resolveImportSpecifier } from "@auaust/engrenage/typescript";
import { describe, expect, test } from "vitest";

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

  test("rejects a file no subpath import covers", () => {
    expect(() => {
      return resolveImportSpecifier(imports, "bin/engrenage/index.ts");
    }).toThrow("found 0");
  });
});
