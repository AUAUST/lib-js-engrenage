import { expect, test } from "vitest";

import { recordLoadedModules } from "#tests/utils/recordLoadedModules";

const eslintModules = /\/src\/tools\/eslint\/index\.ts$|\/node_modules\/(?:eslint|typescript-eslint|@typescript-eslint\/[^/]+)\//u;

// @debt asserts which modules load, an implementation detail, instead of behaviour (BL-9f2b2c)
test("importing the gate loads no ESLint engine", async () => {
  const urls = await recordLoadedModules(
    'await import("#workflows/gate/index");',
  );

  expect(urls).toContainEqual(
    expect.stringContaining("/src/workflows/gate/index.ts"),
  );

  expect(urls.filter((url) => eslintModules.test(url))).toEqual([]);
});
