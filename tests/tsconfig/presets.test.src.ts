import { execFileSync } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { createFilesystem } from "#config/utils/createFilesystem";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";
import { apiGroupRoots } from "#typescript/constants";
import { createTsconfig } from "#typescript/utils/createTsconfig";
import { selectEsLibraries } from "#typescript/utils/selectEsLibraries";

const tsc = createRequire(import.meta.url).resolve("typescript/lib/tsc.js");

function runTsc(...args: string[]): string {
  return execFileSync(process.execPath, [tsc, ...args], {
    encoding: "utf-8",
  });
}

function showConfig(project: string) {
  return JSON.parse(runTsc("--showConfig", "-p", project));
}

function createApisProject(source: string, groups?: string[]): string {
  const project = createTemporaryProject({
    "index.ts": source,
    "tsconfig.json": JSON.stringify({
      extends: ["@auaust/engrenage/tsconfig/library.json"],
      compilerOptions: {
        target: "ESNext",
        lib: ["ESNext"],
        types: (groups ?? ["timers", "performance", "crypto"]).map(
          (group) => `@auaust/engrenage/apis/${group}`,
        ),
      },
      files: ["index.ts"],
    }),
  });

  mkdirSync(project.resolve("node_modules/@auaust"), { recursive: true });

  symlinkSync(
    fileURLToPath(new URL("../..", import.meta.url)),
    project.resolve("node_modules/@auaust/engrenage"),
  );

  return project.root;
}

function createBaselineProject(source: string, append: string[] = []): string {
  const project = createTemporaryProject({
    "index.ts": source,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "bundler",
        strict: true,
        lib: [...(selectEsLibraries("2026-11") ?? []), ...append],
        types: [],
      },
      files: ["index.ts"],
    }),
  });

  return project.root;
}

describe("tsconfig presets", () => {
  test("accepts the built-ins of its selected libs", () => {
    const project = createBaselineProject(
      "export const value = [Object.groupBy([], () => ''), [1].toSorted()];",
    );

    expect(() => runTsc("-p", project)).not.toThrow();
  });

  test("rejects a built-in outside its selected libs", () => {
    const project = createBaselineProject(
      "export const value = [Array.fromAsync([]), new Set().union(new Set())];",
    );

    expect(() => runTsc("-p", project)).toThrow(
      expect.objectContaining({ stdout: expect.stringContaining("TS2550") }),
    );
  });

  test("accepts a built-in of an appended lib", () => {
    const project = createBaselineProject(
      "export const value = Array.fromAsync([]);",
      ["esnext.array"],
    );

    expect(() => runTsc("-p", project)).not.toThrow();
  });

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

  test("resolves the API declaration groups installed as a package", () => {
    const source = `const handle = setInterval((label: string) => {
        performance.now();
        crypto.randomUUID();
      }, 10, "label");

      clearInterval(handle);`;

    expect(() => runTsc("-p", createApisProject(source))).not.toThrow();

    expect(() => runTsc("-p", createApisProject(source, []))).toThrow(
      expect.objectContaining({ stdout: expect.stringContaining("TS2304") }),
    );
  });

  test("type-checks every API group together without skipping library checks", () => {
    const groups = keys(apiGroupRoots);

    const project = createApisProject(
      `export const controller = new AbortController();
      export const stream = new ReadableStream<Uint8Array>();
      export const url = new URL("https://example.com");
      export const blob = new Blob([new TextEncoder().encode("a")]);
      queueMicrotask(() => console.info(new CustomEvent("a")));`,
      groups,
    );

    expect(() =>
      runTsc("-p", project, "--skipLibCheck", "false"),
    ).not.toThrow();
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
