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

  test("composes the library preset with a baseline snapshot", () => {
    const { compilerOptions } = showConfig(getFixture("tsconfig/baseline"));

    expect(compilerOptions).toMatchObject({
      target: "es2024",
      lib: [
        "es2022",
        "es2023.array",
        "es2023.intl",
        "es2024.collection",
        "es2024.object",
        "es2024.promise",
        "es2024.regexp",
        "es2024.string",
      ],
      types: [],
      exactOptionalPropertyTypes: true,
    });
  });

  test("gives Node tooling its runtime's features and types", () => {
    const { compilerOptions } = showConfig(getFixture("tsconfig/node"));

    expect(compilerOptions).toMatchObject({
      target: "es2025",
      lib: ["es2025"],
      types: ["node"],
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
      target: "esnext",
      lib: ["esnext"],
      types: ["node"],
    });

    expect(files).toEqual([
      join(library, "tests/index.ts"),
      join(library, "src/env.d.ts"),
    ]);
  });
});
