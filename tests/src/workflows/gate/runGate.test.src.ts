import { writeFileSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGitRepository } from "#tests/utils/createGitRepository";
import { getExecutable } from "#tests/utils/getExecutable";
import { checkAgentStop } from "#workflows/gate/operations/checkAgentStop";
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
      ".gitignore": "node_modules\n.runs\n.env.*\n!.env.example\n",
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
  test("rejects local additions and modifications, but accepts deletions", async () => {
    const { project, git } = await createRepository();

    project.write(".ai/issues/1.md", "draft\n");
    project.write(".env.local", "SECRET=value\n");

    git("add", "--force", ".ai/issues/1.md", ".env.local");

    const config = await loadConfig(project.root);

    const options = { mode: "staged", audience: "everyone" } as const;

    const { failures } = await runGate(config, options);

    expect(failures).toEqual([
      {
        step: "local files",
        output: expect.stringContaining(".ai/issues/1.md"),
      },
    ]);

    expect(failures[0]?.output).toContain(".env.local");
    expect(failures[0]?.output).toContain("git restore --staged");
    expect(failures[0]?.output).toContain("git rm --cached");

    git(
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.com",
      "commit",
      "--quiet",
      "-m",
      "fixture",
    );

    project.write(".ai/issues/1.md", "modified\n");

    git("add", ".ai/issues/1.md");

    expect((await runGate(config, options)).failures[0]?.output).toContain(
      ".ai/issues/1.md",
    );

    git("rm", "--force", ".ai/issues/1.md", ".env.local");

    expect(await runGate(config, options)).toEqual({
      failures: [],
      warnings: [],
    });
  });

  test("allows an excluded draft and replaces gitignore defaults with an array", async () => {
    const { project, git } = await createRepository();

    project.write(
      "engrenage.config.ts",
      'export default { git: { local: { files: { exclude: ".ai/issues/" } } } };\n',
    );

    project.write(".ai/issues/1.md", "draft\n");

    git("add", ".ai/issues/1.md");

    const options = { mode: "staged", audience: "everyone" } as const;

    expect(await runGate(await loadConfig(project.root), options)).toEqual({
      failures: [],
      warnings: [],
    });

    project.write(
      "engrenage.config.ts",
      'export default { git: { local: { files: ["x"] } } };\n',
    );

    project.write(".env.local", "SECRET=value\n");

    git("add", "--force", ".env.local");
    loadConfig.refresh(project.root);

    expect(await runGate(await loadConfig(project.root), options)).toEqual({
      failures: [],
      warnings: [],
    });

    project.write("x", "local\n");

    git("add", "x");

    expect(
      (await runGate(await loadConfig(project.root), options)).failures[0]
        ?.output,
    ).toContain("x");
  });

  test("everyone skips agent steps, partial staging, stamps and warnings", async () => {
    const { project, git } = await createRepository();

    project.write("src/index.ts", 'export const value: number = "text"\n');

    git("add", "src/index.ts");
    project.write("src/index.ts", 'export const value: number = "unstaged"\n');

    expect(
      await runGate(await loadConfig(project.root), {
        mode: "staged",
        audience: "everyone",
      }),
    ).toEqual({ failures: [], warnings: [] });

    expect(
      await (await loadConfig(project.root)).context.filesystem.exists(".runs"),
    ).toBe(false);

    expect(project.read("src/index.ts")).toContain('"unstaged"');
  });

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

  test("keeps failing-stop escapes separate for runtime, session and agent", async () => {
    const { project } = await createRepository();

    project.write("src/index.ts", 'export const value: number = "text";\n');

    const config = await loadConfig(project.root);

    const identity = {
      runtime: "codex",
      session: "session",
      agent: "agent",
    };

    expect(await checkAgentStop(config, identity)).toContain("typecheck");
    expect(await checkAgentStop(config, identity)).toBeUndefined();

    expect(
      await checkAgentStop(config, { ...identity, runtime: "claude" }),
    ).toContain("typecheck");

    expect(
      await checkAgentStop(config, { ...identity, session: "another" }),
    ).toContain("typecheck");

    expect(
      await checkAgentStop(config, { ...identity, agent: "another" }),
    ).toContain("typecheck");
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

    expect(warnings).toEqual([
      {
        step: "budgets",
        output: expect.stringContaining("over the debtEntry budget of 60."),
      },
    ]);
  });
});
