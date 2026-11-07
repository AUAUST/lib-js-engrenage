import { describe, expect, test } from "vitest";

import { createPackageJson } from "#project/package/operations/createPackageJson";
import { resolveVisibility } from "#project/package/operations/resolveVisibility";

function createManifest(manifest: object) {
  return createPackageJson({
    root: "/project",
    path: "/project/package.json",
    content: JSON.stringify(manifest),
  });
}

describe("resolveVisibility", () => {
  test("derives an unset visibility from publishConfig.access, else private", () => {
    expect(
      resolveVisibility(
        undefined,
        createManifest({
          publishConfig: { access: "public" },
        }),
      ),
    ).toBe("public");

    expect(resolveVisibility(undefined, createManifest({}))).toBe("private");
  });

  test("prefers the declared visibility over publishConfig.access", () => {
    expect(
      resolveVisibility(
        "private",
        createManifest({
          publishConfig: { access: "public" },
        }),
      ),
    ).toBe("private");
  });
});
