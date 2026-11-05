import { execFileSync } from "node:child_process";
import { mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";
import { runGate } from "#workflows/gate/operations/runGate";
import { readConfig } from "#workflows/registry/operations/readConfig";

const repositoryModules = fileURLToPath(
  new URL("../../../../node_modules", import.meta.url),
);

const argv = process.argv;

beforeEach(() => {
  process.argv = [argv[0] ?? "node", getExecutable()];
});

afterEach(() => {
  process.argv = argv;
});

function createRepository() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "project",
      type: "module",
      devDependencies: { prettier: "*", typescript: "*" },
    }),
    "engrenage.config.ts":
      'export default { src: { baseline: "2026-10" }, agents: { gate: { commands: ["echo run >> .runs"] } } };\n',
    ".gitignore": "node_modules\n.runs\n",
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        strict: true,
        module: "ESNext",
        moduleResolution: "Bundler",
        allowImportingTsExtensions: true,
        noEmit: true,
      },
      files: [],
      references: [{ path: "./tsconfig.src.json" }],
    }),
    "tsconfig.src.json": JSON.stringify({
      extends: "./tsconfig.json",
      compilerOptions: {
        tsBuildInfoFile: "./node_modules/.cache/tsconfig/src.tsbuildinfo",
      },
      include: ["src"],
    }),
    "src/index.ts": "export const value: number = 1;\n",
  });

  mkdirSync(project.resolve("node_modules"));

  for (const name of ["prettier", "typescript"]) {
    symlinkSync(
      join(repositoryModules, name),
      project.resolve(`node_modules/${name}`),
    );
  }

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  function git(...args: string[]): string {
    return execFileSync("git", args, {
      cwd: project.root,
      encoding: "utf-8",
    });
  }

  execFileSync(process.execPath, [getExecutable(), "sync"], {
    cwd: project.root,
    stdio: "ignore",
  });

  git("init", "--quiet");
  git("add", "-A");

  git(
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.com",
    "commit",
    "--quiet",
    "-m",
    "initial",
  );

  return { project, git };
}

describe("runGate", { timeout: binaryTimeout }, () => {
  test("rewrites, re-stages and passes an unformatted staged file", async () => {
    const { project, git } = createRepository();

    project.write("src/index.ts", "export const value: number = 2\n");

    git("add", "src/index.ts");

    const failures = await runGate(await readConfig(project.root), {
      mode: "staged",
    });

    expect(failures).toEqual([]);

    expect(project.read("src/index.ts")).toBe(
      "export const value: number = 2;\n",
    );

    expect(git("diff", "--name-only")).toBe("");

    expect(git("show", ":src/index.ts")).toBe(
      "export const value: number = 2;\n",
    );
  });

  test("fails a staged type error under typecheck", async () => {
    const { project, git } = createRepository();

    project.write("src/index.ts", 'export const value: number = "text";\n');

    git("add", "src/index.ts");

    const failures = await runGate(await readConfig(project.root), {
      mode: "staged",
    });

    expect(failures.map(({ step }) => step)).toEqual(["typecheck"]);
    expect(failures[0]?.output).toContain("src/index.ts(1,14): error TS2322");
  });

  test("fails a partially staged file before any fix", async () => {
    const { project, git } = createRepository();

    project.write("src/index.ts", "export const value: number = 2\n");

    git("add", "src/index.ts");

    writeFileSync(
      project.resolve("src/index.ts"),
      "export const value: number = 3\n",
    );

    const failures = await runGate(await readConfig(project.root), {
      mode: "staged",
    });

    expect(failures).toEqual([
      { step: "staging", output: expect.stringContaining("src/index.ts") },
    ]);

    expect(project.read("src/index.ts")).toBe(
      "export const value: number = 3\n",
    );
  });

  test("returns from the stamp on a tree that already passed", async () => {
    const { project, git } = createRepository();

    project.write("src/index.ts", "export const value: number = 2;\n");

    git("add", "src/index.ts");

    const config = await readConfig(project.root);

    expect(await runGate(config, { mode: "staged" })).toEqual([]);
    expect(await runGate(config, { mode: "staged" })).toEqual([]);

    expect(project.read(".runs")).toBe("run\n");
  });
});
