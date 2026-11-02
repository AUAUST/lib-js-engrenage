import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, symlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createFilesystem } from "#config/utils/createFilesystem";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";
import { createTsconfig } from "#typescript/utils/createTsconfig";

const root = fileURLToPath(new URL("../..", import.meta.url));

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

function createBaselineProject(source: string): string {
  const project = createTemporaryProject({
    "index.ts": source,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        noLib: true,
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "bundler",
        strict: true,
        types: ["typescript-baseline-lib/year/2023"],
      },
      files: ["index.ts"],
    }),
  });

  mkdirSync(project.resolve("node_modules"), { recursive: true });

  symlinkSync(
    dirname(
      createRequire(import.meta.url).resolve(
        "typescript-baseline-lib/package.json",
      ),
    ),
    project.resolve("node_modules/typescript-baseline-lib"),
  );

  return project.root;
}

describe("tsconfig presets", () => {
  test("accepts the built-ins of its Baseline year", () => {
    const project = createBaselineProject(
      "export const value = [1].toSorted().findLast(() => true);",
    );

    expect(() => runTsc("-p", project)).not.toThrow();
  });

  test("rejects a built-in newer than its Baseline year", () => {
    const project = createBaselineProject(
      'export const value = Object.groupBy([], () => "");',
    );

    expect(() => runTsc("-p", project)).toThrow(
      expect.objectContaining({ stdout: expect.stringContaining("groupBy") }),
    );
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
    const groups = readdirSync(join(root, "data/apis"))
      .filter((file) => file.endsWith(".d.ts"))
      .map((file) => file.slice(0, -".d.ts".length));

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
