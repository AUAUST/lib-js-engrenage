import { writeFileSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGitRepository } from "#tests/utils/createGitRepository";
import { getExecutable } from "#tests/utils/getExecutable";
import { runGate } from "#workflows/gate/operations/runGate";

const argv = process.argv;

beforeEach(() => {
  process.argv = [argv[0] ?? "node", getExecutable()];
});

afterEach(() => {
  process.argv = argv;
});

function createRepository() {
  return createGitRepository(
    {
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
    },
    ["prettier", "typescript"],
  );
}

describe("runGate", { timeout: binaryTimeout }, () => {
  test("rewrites, re-stages and passes an unformatted staged file", async () => {
    const { project, git } = await createRepository();

    project.write("src/index.ts", "export const value: number = 2\n");

    git("add", "src/index.ts");

    const { failures } = await runGate(await loadConfig(project.root), {
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
    const { project, git } = await createRepository();

    project.write("src/index.ts", 'export const value: number = "text";\n');

    git("add", "src/index.ts");

    const { failures } = await runGate(await loadConfig(project.root), {
      mode: "staged",
    });

    expect(failures.map(({ step }) => step)).toEqual(["typecheck"]);
    expect(failures[0]?.output).toContain("src/index.ts(1,14): error TS2322");
  });

  test("fails a partially staged file before any fix", async () => {
    const { project, git } = await createRepository();

    project.write("src/index.ts", "export const value: number = 2\n");

    git("add", "src/index.ts");

    writeFileSync(
      project.resolve("src/index.ts"),
      "export const value: number = 3\n",
    );

    const { failures } = await runGate(await loadConfig(project.root), {
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
    const { project, git } = await createRepository();

    project.write("src/index.ts", "export const value: number = 2;\n");

    git("add", "src/index.ts");

    const config = await loadConfig(project.root);

    const passed = { failures: [], warnings: [] };

    expect(await runGate(config, { mode: "staged" })).toEqual(passed);
    expect(await runGate(config, { mode: "staged" })).toEqual(passed);

    expect(project.read(".runs")).toBe("run\n");
  });

  test("passes a changed debt entry over budget with a budget warning", async () => {
    const { project } = await createRepository();

    project.write(
      ".ai/debt.md",
      `# Debt\n\n## Long entry\n\n${Array.from({ length: 80 }, () => "word").join(" ")}\n`,
    );

    const { failures, warnings } = await runGate(
      await loadConfig(project.root),
      { mode: "worktree" },
    );

    expect(failures).toEqual([]);

    expect(warnings).toMatchObject([
      {
        subject: "Long entry",
        kind: "debtEntry",
        budget: 60,
      },
    ]);
  });
});
