import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { createPackageJson } from "#support/packageJson/utils/createPackageJson";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "engrenage-package-"));
});

afterEach(() => {
  rmSync(root, {
    recursive: true,
    force: true,
  });
});

function createManifest(manifest: object) {
  const path = join(root, "package.json");

  writeFileSync(path, JSON.stringify(manifest));

  return createPackageJson({
    root,
    path,
  });
}

describe("createPackageJson", () => {
  test("mirrors each field in a strict and an optional view", () => {
    const packageJson = createManifest({
      name: "fixture",
    });

    expect(packageJson.name).toBe("fixture");
    expect(packageJson.optional.imports).toBeUndefined();
    expect(() => packageJson.imports).toThrow('does not declare "imports"');
  });

  test("rejects an invalid field in both views", () => {
    const packageJson = createManifest({
      name: 42,
    });

    expect(() => packageJson.optional.name).toThrow("name");
  });
});
