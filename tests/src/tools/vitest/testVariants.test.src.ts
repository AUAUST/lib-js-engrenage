import { describe, expect, test } from "vitest";
import { startVitest } from "vitest/node";

import { createContext } from "#project/config/utils/createContext";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createVitestConfig } from "#tools/vitest/operations/createVitestConfig";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

function createLibrary(config = "{ preset: 'library' }") {
  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      exports: { ".": "./dist/index.mjs" },
    }),
    "engrenage.config.ts": `export default ${config};\n`,
    "tsconfig.json": "{}",
    "tsconfig.tests.json": "{}",
    "tsconfig.tests.dist.json": "{}",
    "src/index.ts": "export const value = 1;\n",
    "dist/index.mjs": "export const value = 1;\n",
    "tests/plain.test.ts":
      'import { value } from "library";\nimport { test, expect } from "vitest";\ntest("plain", () => { expect(value).toBe(1); });\n',
    "tests/internal.test.src.ts":
      'import { value } from "../src/index.ts";\nimport { test, expect } from "vitest";\ntest("internal", () => { expect(value).toBe(1); });\n',
    "tests/built.test.dist.ts":
      'import { value } from "library";\nimport { test, expect } from "vitest";\ntest("built", () => { expect(value).toBe(1); });\n',
  });
}

async function collect(root: string, mode: "test" | "build") {
  const config = await loadConfig(root);

  const vitest = await startVitest(
    "test",
    [],
    {
      root,
      config: false,
      run: true,
      watch: false,
      reporters: [],
    },
    createVitestConfig(createContext(config), { command: "serve", mode }),
  );

  try {
    return vitest.state.getFiles().map((file) => {
      return [
        file.name,
        file.result?.state,
        file.result?.errors?.[0]?.message ?? "",
      ] as const;
    });
  } finally {
    await vitest.close();

    process.exitCode = undefined;
  }
}

describe("test variants", () => {
  test("collects the plain and source variants in source mode, the plain and dist variants in build mode", async () => {
    const project = createLibrary();

    const config = await loadConfig(project.root);

    expect(config.tests.patterns).toEqual({
      plain: ["**/*.{spec,test}.{ts,tsx}"],
      source: ["**/*.{spec,test}.src.{ts,tsx}"],
      dist: ["**/*.{spec,test}.dist.{ts,tsx}"],
    });

    expect(
      createVitestConfig(createContext(config), {
        command: "serve",
        mode: "test",
      }).test?.include,
    ).toEqual(["**/*.{spec,test}.{ts,tsx}", "**/*.{spec,test}.src.{ts,tsx}"]);

    expect(
      createVitestConfig(createContext(config), {
        command: "serve",
        mode: "build",
      }).test?.include,
    ).toEqual(["**/*.{spec,test}.{ts,tsx}", "**/*.{spec,test}.dist.{ts,tsx}"]);
  });

  test("derives the patterns from custom location, suffix and extension parts", async () => {
    const project = createLibrary(
      "{ preset: 'library', tests: { location: 'tests/**/*', suffix: '.spec', extension: '.ts' } }",
    );

    const config = await loadConfig(project.root);

    expect(config.tests.files).toEqual([
      "tests/**/*.spec.ts",
      "tests/**/*.spec.src.ts",
      "tests/**/*.spec.dist.ts",
    ]);
  });

  test("runs the plain and dist variants through the package in build mode", async () => {
    const files = await collect(createLibrary().root, "build");

    expect(files.map(([name, state]) => [name, state])).toEqual(
      expect.arrayContaining([
        ["tests/built.test.dist.ts", "pass"],
        ["tests/plain.test.ts", "pass"],
      ]),
    );

    expect(files).toHaveLength(2);
  });

  test("fails a test whose import resolves into the sources in build mode", async () => {
    const project = createLibrary();

    project.write(
      "tests/plain.test.ts",
      'import { value } from "../src/index.ts";\nimport { test, expect } from "vitest";\ntest("plain", () => { expect(value).toBe(1); });\n',
    );

    const files = await collect(project.root, "build");

    const failed = files.find(([name]) => name === "tests/plain.test.ts");

    expect(failed?.[1]).toBe("fail");
    expect(failed?.[2]).toContain("resolves to the source");
  });
});
