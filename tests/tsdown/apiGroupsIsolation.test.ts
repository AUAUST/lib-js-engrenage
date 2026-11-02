import { spawnSync } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { createRequire } from "node:module";

import { build } from "tsdown";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { createTsdownConfig } from "@auaust/engrenage/tsdown";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { linkSourcePackage } from "#tests/helpers/linkSourcePackage";
import { mockCwd } from "#tests/helpers/mockCwd";
import { selectEsLibraries } from "#typescript/utils/selectEsLibraries";

const require = createRequire(import.meta.url);

const tsc = require.resolve("typescript/lib/tsc.js");

function runTsc(project: string): string {
  return spawnSync(process.execPath, [tsc, "-p", project], {
    encoding: "utf-8",
  }).stdout;
}

function link(project: { resolve(path: string): string }) {
  mkdirSync(project.resolve("node_modules/@auaust"), { recursive: true });

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));
}

async function buildLibrary() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@scope/library",
      version: "1.0.0",
      type: "module",
      exports: {
        ".": { types: "./dist/index.d.mts", default: "./dist/index.mjs" },
      },
    }),
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        outDir: "dist",
        rootDir: ".",
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "Bundler",
        strict: true,
        declaration: true,
        lib: selectEsLibraries("2026-11"),
        types: [
          "@auaust/engrenage/apis/disposable",
          "@auaust/engrenage/apis/float16",
        ],
        paths: { "@scope/library": ["./src/index.ts"] },
      },
      include: ["src"],
    }),
    "src/index.ts": [
      "export interface Resource {",
      "  [Symbol.dispose](): void;",
      "}",
      "export const round = (value: number) => Math.f16round(value);",
    ].join("\n"),
  });

  link(project);

  mockCwd(project.root);

  const config = await loadConfig(project.root);

  await build({
    ...createTsdownConfig(config, { ci: false }),
    config: false,
    logLevel: "silent",
  });

  return project;
}

function createConsumer(
  library: { resolve(path: string): string },
  library_: string,
  source: string,
) {
  const consumer = createTemporaryProject({
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        lib: [library_],
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "Bundler",
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        types: [],
      },
      files: ["index.ts"],
    }),
    "index.ts": source,
  });

  mkdirSync(consumer.resolve("node_modules/@scope"), { recursive: true });

  symlinkSync(
    library.resolve(""),
    consumer.resolve("node_modules/@scope/library"),
  );

  return consumer;
}

describe("api groups of a library", () => {
  test("never reach its published declarations nor its consumers", async () => {
    const library = await buildLibrary();

    expect(runTsc(library.root)).toBe("");

    const declarations = library.read("dist/index.d.mts");

    expect(declarations).not.toContain("@auaust/engrenage/apis/");
    expect(declarations).not.toContain("declare global");

    expect(declarations).not.toMatch(
      /(?:interface|class) (?:Disposable|SymbolConstructor|Float16Array)\b/,
    );

    const modern = createConsumer(
      library,
      "ESNext",
      [
        'import type { Resource } from "@scope/library";',
        "export const key: keyof Resource = Symbol.dispose;",
        "export const same: Disposable = {} as Resource;",
      ].join("\n"),
    );

    expect(runTsc(modern.root)).toBe("");

    const legacy = createConsumer(
      library,
      "ES2023",
      [
        'import "@scope/library";',
        "export const key = Symbol.dispose;",
        "export const value: Disposable | undefined = undefined;",
        "export const rounded = Math.f16round(1);",
      ].join("\n"),
    );

    const output = runTsc(legacy.root);

    expect(output).toContain("TS2550");
    expect(output).toContain("TS2304");
  });
});
