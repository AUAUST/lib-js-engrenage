import { describe, expect, test } from "vitest";

import { createPackageJson } from "#support/packageJson/utils/createPackageJson";

function createManifest(manifest: object) {
  return createPackageJson({
    root: "/project",
    path: "/project/package.json",
    content: JSON.stringify(manifest),
  });
}

describe("createPackageJson", () => {
  test("mirrors each field in a strict and an optional view", () => {
    const packageJson = createManifest({
      name: "fixture",
    });

    expect(packageJson.name).toBe("fixture");
    expect(packageJson.dependencies).toEqual([]);
    expect(packageJson.optional.imports).toBeUndefined();
    expect(() => packageJson.imports).toThrow('does not declare "imports"');
  });

  test("rejects an invalid field in both views", () => {
    const packageJson = createManifest({
      name: 42,
      peerDependencies: {
        zod: 4,
      },
    });

    expect(() => packageJson.optional.name).toThrow("name");
    expect(() => packageJson.dependencies).toThrow("peerDependencies");
  });

  test("exposes standard metadata fields with their expected types", () => {
    const packageJson = createManifest({
      version: "1.2.3",
      author: {
        name: "AUAUST",
        email: "hello@auaust.ch",
      },
      keywords: ["tooling", 1],
    });

    expect(packageJson.version).toBe("1.2.3");

    expect(packageJson.author).toEqual({
      name: "AUAUST",
      email: "hello@auaust.ch",
    });

    expect(packageJson.optional.description).toBeUndefined();
    expect(() => packageJson.optional.keywords).toThrow("keywords");
  });
});
