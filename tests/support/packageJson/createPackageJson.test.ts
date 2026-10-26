import { describe, expect, test } from "vitest";

import { packageJsonFile } from "#constants";
import { createPackageJson } from "#support/packageJson/utils/createPackageJson";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

function createManifest(manifest: object) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify(manifest),
  });

  return createPackageJson({
    root: project.root,
    path: project.resolve(packageJsonFile),
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
});
