import { execFileSync } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { createFilesystem } from "#config/utils/createFilesystem";
import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";
import { createTsconfig } from "#typescript/utils/createTsconfig";
import { listTsconfigPresets } from "#typescript/utils/listTsconfigPresets";

const dataTsconfig = fileURLToPath(
  new URL("../../data/tsconfig", import.meta.url),
);

const tsc = createRequire(import.meta.url).resolve("typescript/lib/tsc.js");

function runTsc(...args: string[]): string {
  return execFileSync(process.execPath, [tsc, ...args], {
    encoding: "utf-8",
  });
}

function showConfig(project: string) {
  return JSON.parse(runTsc("--showConfig", "-p", project));
}

function createApisProject(source: string): string {
  const project = createTemporaryProject({
    "index.ts": source,
    "tsconfig.json": JSON.stringify({
      extends: [
        "@auaust/engrenage/tsconfig/library.json",
        "@auaust/engrenage/tsconfig/baseline/2026-10.json",
      ],
      compilerOptions: {
        types: [
          "@auaust/engrenage/apis/timers",
          "@auaust/engrenage/apis/performance",
          "@auaust/engrenage/apis/crypto",
        ],
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

describe("tsconfig presets", () => {
  test.each([
    ["baseline", ["lib", "target"]],
    ["node", ["lib", "target", "types"]],
  ] as const)(
    "sets exactly the runtime fields in %s snippets",
    (kind, fields) => {
      const presets = listTsconfigPresets(kind);

      expect(presets).not.toHaveLength(0);

      for (const preset of presets) {
        const { compilerOptions } = readJsonFile(
          join(dataTsconfig, kind, `${preset}.json`),
        ) as { compilerOptions: object };

        expect(keys(compilerOptions).sort()).toEqual(fields);
      }
    },
  );

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

  test("resolves the API declaration groups installed as a package", () => {
    const project = createApisProject(
      `const handle = setTimeout((label: string) => {
        performance.now();
        crypto.getRandomValues(new Uint8Array(1));
      }, 10, "label");

      clearTimeout(handle);`,
    );

    expect(() => runTsc("-p", project)).not.toThrow();
  });

  test("keeps timer handles opaque", () => {
    const project = createApisProject(
      "export const handle: number = setTimeout(() => {}, 10);",
    );

    expect(() => runTsc("-p", project)).toThrow(
      expect.objectContaining({ stdout: expect.stringContaining("TS2322") }),
    );
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
