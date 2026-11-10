import { beforeEach, describe, expect, test } from "vitest";

import { map } from "@auaust/primitive-kit/arrays";

import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGateRepository } from "#tests/utils/createGateRepository";
import { mockExecutableArgv } from "#tests/utils/mockExecutableArgv";
import { runGate } from "#workflows/gate/operations/runGate";

beforeEach(mockExecutableArgv);

describe("runGate", { timeout: binaryTimeout }, () => {
  test("rewrites, re-stages and passes an unformatted staged file", async () => {
    const { project, git } = await createGateRepository();

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
    const { project, git } = await createGateRepository();

    project.write("src/index.ts", 'export const value: number = "text";\n');

    git("add", "src/index.ts");

    const { failures } = await runGate(await loadConfig(project.root), {
      mode: "staged",
    });

    expect(failures.map(({ step }) => step)).toEqual(["typecheck"]);
    expect(failures[0]?.output).toContain("src/index.ts(1,14): error TS2322");
  });

  test("fails the gate with the output of a contributed check", async () => {
    const { project } = await createGateRepository();

    project.write(
      "engrenage.config.ts",
      `export default {
  src: { baseline: "2026-10" },
  extensions: [
    {
      name: "gate-fixture",
      contributes: {
        "gate.steps": [
          {
            name: "fixture",
            stage: "checks",
            audience: "agents",
            async load() {
              return async () => ({ ok: false, output: "fixture failed" });
            },
          },
        ],
      },
    },
  ],
};
`,
    );

    project.write("src/index.ts", "export const value: number = 2;\n");

    loadConfig.refresh(project.root);

    const { failures } = await runGate(await loadConfig(project.root), {
      mode: "worktree",
    });

    expect(failures).toEqual([{ step: "fixture", output: "fixture failed" }]);
  });

  test("reports a failing check before a failing command", async () => {
    const { project } = await createGateRepository(["exit 3"]);

    project.write("src/index.ts", 'export const value: number = "text";\n');

    const { failures } = await runGate(await loadConfig(project.root), {
      mode: "worktree",
    });

    expect(failures.map(({ step }) => step)).toEqual(["typecheck", "exit 3"]);
  });

  test("runs no ESLint fix in a project without ESLint installed", async () => {
    const { project, git } = await createGateRepository();

    project.write("src/index.ts", "export const value: number = 2;\n");

    git("add", "src/index.ts");

    const config = await loadConfig(project.root);

    const contributions = await config.context.registry.contributions(
      "gate.steps",
      config,
    );

    expect(map(contributions, ({ entry }) => entry.name)).not.toContain(
      "eslint",
    );

    expect(await runGate(config, { mode: "staged" })).toEqual({
      failures: [],
      warnings: [],
    });
  });

  test("runs no Prettier fix in a project without Prettier installed", async () => {
    const {
      project,
      git,
    } = await createGateRepository(undefined, ["typescript"]);

    project.write("src/index.ts", "export const value: number = 2\n");

    git("add", "src/index.ts");

    expect(
      await runGate(await loadConfig(project.root), { mode: "staged" }),
    ).toEqual({ failures: [], warnings: [] });

    expect(project.read("src/index.ts")).toBe(
      "export const value: number = 2\n",
    );
  });

  test("passes a changed debt entry over budget with a budget warning", async () => {
    const { project } = await createGateRepository();

    project.write(
      ".ai/debt.md",
      `# Debt\n\n## Long entry\n\n${Array.from({ length: 80 }, () => "word").join(" ")}\n`,
    );

    const {
      failures,
      warnings,
    } = await runGate(await loadConfig(project.root), { mode: "worktree" });

    expect(failures).toEqual([]);

    expect(warnings).toEqual([
      {
        step: "budgets",
        output: expect.stringContaining("over the debtEntry budget of 60."),
      },
    ]);
  });
});
