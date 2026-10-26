import { describe, expect, test } from "vitest";

import { writePackageJsonValue } from "#support/packageJson/utils/writePackageJsonValue";

const manifest = `{
  "name": "project",
  "type": "module",
  "devDependencies": {
    "eslint": "^10.0.0",
    "vitest": "^5.0.0"
  },
  "publishConfig": {}
}
`;

describe("writePackageJsonValue", () => {
  test("inserts properties in the canonical order and collection keys alphabetically", () => {
    const withPrettier = writePackageJsonValue(
      manifest,
      "package.json",
      ["prettier"],
      "@auaust/engrenage/prettier",
    );

    const withDependency = writePackageJsonValue(
      withPrettier,
      "package.json",
      ["devDependencies", "prettier"],
      "^3.0.0",
    );

    const parsed: unknown = JSON.parse(withDependency);

    expect(parsed).toEqual({
      name: "project",
      type: "module",
      devDependencies: {
        eslint: "^10.0.0",
        prettier: "^3.0.0",
        vitest: "^5.0.0",
      },
      prettier: "@auaust/engrenage/prettier",
      publishConfig: {},
    });
    expect(withDependency.indexOf('"prettier": "@auaust')).toBeGreaterThan(
      withDependency.indexOf('"devDependencies"'),
    );
    expect(withDependency.indexOf('"prettier": "@auaust')).toBeLessThan(
      withDependency.indexOf('"publishConfig"'),
    );
    expect(withDependency.indexOf('"prettier": "^3')).toBeLessThan(
      withDependency.indexOf('"vitest"'),
    );
  });

  test("creates a missing collection at its canonical position", () => {
    const content = writePackageJsonValue(
      '{\n  "name": "project",\n  "publishConfig": {}\n}\n',
      "package.json",
      ["scripts", "ci:test"],
      "vitest run",
    );

    expect(content).toBe(`{
  "name": "project",
  "scripts": {
    "ci:test": "vitest run"
  },
  "publishConfig": {}
}
`);
  });
});
