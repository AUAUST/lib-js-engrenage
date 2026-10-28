import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { createFilesystem } from "#config/utils/createFilesystem";
import { getFixture } from "#tests/helpers/getFixture";
import { createTsconfig } from "#typescript/utils/createTsconfig";

const tsc = createRequire(import.meta.url).resolve("typescript/lib/tsc.js");

function runTsc(...args: string[]): string {
  return execFileSync(process.execPath, [tsc, ...args], {
    encoding: "utf-8",
  });
}

function showConfig(project: string) {
  return JSON.parse(runTsc("--showConfig", "-p", project));
}

describe("tsconfig presets", () => {
  test("resolves the base preset through the package exports", () => {
    const { compilerOptions } = showConfig(getFixture("tsconfig/base"));

    expect(compilerOptions).toMatchObject({
      declaration: false,
      strict: true,
      moduleResolution: "bundler",
      verbatimModuleSyntax: true,
    });
  });

  test("resolves library output paths inside the consumer", () => {
    const library = getFixture("tsconfig/library");

    const { compilerOptions } = createTsconfig({
      root: library,
      path: join(library, "tsconfig.json"),
      filesystem: createFilesystem(library),
    });

    expect(compilerOptions).toMatchObject({
      declaration: false,
      outDir: join(library, "dist"),
      rootDir: library,
    });
  });

  test("type-checks tests and env declarations in dist mode", () => {
    const library = getFixture("tsconfig/library");

    const project = join(library, "tsconfig.dist.json");

    const { compilerOptions } = showConfig(project);

    const files = runTsc("--listFilesOnly", "-p", project)
      .split(/\r?\n/)
      .filter((file) => file.startsWith(library));

    expect(compilerOptions).toMatchObject({
      paths: {},
      skipLibCheck: false,
    });

    expect(files).toEqual([
      join(library, "tests/index.ts"),
      join(library, "src/env.d.ts"),
    ]);
  });
});
