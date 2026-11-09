import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { existsSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import { setTimeout } from "node:timers/promises";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { map } from "@auaust/primitive-kit/arrays";
import { record } from "@auaust/toolkit/object";

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

const slowCommand = "echo start >> .runs && sleep 1 && echo end >> .runs";

const identity = {
  runtime: "codex",
  session: "session",
  agent: "agent",
};

function createRepository(
  commands: readonly string[] = ["echo run >> .runs"],
  modules: readonly string[] = ["prettier", "typescript"],
) {
  return createGitRepository(
    {
      "package.json": JSON.stringify({
        name: "project",
        type: "module",
        devDependencies: record(map(modules, (name) => [name, "*"])),
      }),
      "engrenage.config.ts": `export default { src: { baseline: "2026-10" }, agents: { gate: { commands: ${JSON.stringify(commands)} } } };\n`,
      ".gitignore": "node_modules\n.runs*\n.env.*\n!.env.example\n",
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
    modules,
  );
}

async function readLockFile(root: string): Promise<string> {
  const cache = await (await loadConfig(root)).resolve("cache");

  return `${cache.for("gate")}/lock`;
}

async function waitForLock(root: string): Promise<string> {
  const lock = await readLockFile(root);

  while (!existsSync(lock)) {
    await setTimeout(50);
  }

  return lock;
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

  test("fails the gate with the output of a contributed check", async () => {
    const { project } = await createRepository();

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

  test("runs no ESLint fix in a project without ESLint installed", async () => {
    const { project, git } = await createRepository();

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
    const { project, git } = await createRepository(undefined, ["typescript"]);

    project.write("src/index.ts", "export const value: number = 2\n");

    git("add", "src/index.ts");

    expect(
      await runGate(await loadConfig(project.root), { mode: "staged" }),
    ).toEqual({ failures: [], warnings: [] });

    expect(project.read("src/index.ts")).toBe(
      "export const value: number = 2\n",
    );
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

  test("runs simultaneous gates one after the other", async () => {
    const { project } = await createRepository([
      `${slowCommand} && test -f .runs-failed || { touch .runs-failed; exit 1; }`,
    ]);

    project.write("src/index.ts", "export const value: number = 2;\n");

    const config = await loadConfig(project.root);

    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    try {
      const reports = await Promise.all([
        runGate(config, { mode: "worktree" }),
        runGate(config, { mode: "worktree" }),
      ]);

      expect(map(reports, ({ failures }) => failures.length)).toEqual(
        expect.arrayContaining([0, 1]),
      );

      expect(write).toHaveBeenCalledWith(
        expect.stringContaining("Waiting for the worktree gate of process"),
      );
    } finally {
      write.mockRestore();
    }

    expect(project.read(".runs")).toBe("start\nend\nstart\nend\n");
  });

  test("reuses a passing stop for the commit that waited on it", async () => {
    const { project, git } = await createRepository([slowCommand]);

    project.write("src/index.ts", "export const value: number = 2;\n");
    project.write(".ai/issues/1.md", "draft\n");

    const config = await loadConfig(project.root);

    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    try {
      const stop = checkAgentStop(config, identity);

      await waitForLock(project.root);

      git("add", "src/index.ts");

      const commit = runGate(config, { mode: "staged" });

      expect(await stop).toBeUndefined();
      expect(await commit).toEqual({ failures: [], warnings: [] });
    } finally {
      write.mockRestore();
    }

    expect(project.read(".runs")).toBe("start\nend\n");
    expect(git("status", "--porcelain")).toContain("?? .ai/");
  });

  test("checks again a commit whose content the stop did not pass", async () => {
    const { project, git } = await createRepository();

    project.write("src/index.ts", "export const value: number = 2;\n");

    const config = await loadConfig(project.root);

    expect(await checkAgentStop(config, identity)).toBeUndefined();

    project.write("src/index.ts", "export const value: number = 3;\n");

    git("add", "src/index.ts");

    expect(await runGate(config, { mode: "staged" })).toEqual({
      failures: [],
      warnings: [],
    });

    expect(project.read(".runs")).toBe("run\nrun\n");
  });

  test("fails a tree edited during verification, but not for a local draft", async () => {
    const { project, git } = await createRepository([
      "test -f .runs-edited || { touch .runs-edited; echo 'export const other = 3;' >> src/index.ts; }",
      "mkdir -p .ai/issues && echo draft > .ai/issues/2.md && echo run >> .runs",
    ]);

    project.write("src/index.ts", "export const value: number = 2;\n");

    const config = await loadConfig(project.root);

    const { failures } = await runGate(config, { mode: "worktree" });

    expect(failures).toEqual([
      { step: "verification", output: expect.stringContaining("src/index.ts") },
    ]);

    expect(await runGate(config, { mode: "worktree" })).toEqual({
      failures: [],
      warnings: [],
    });

    git("add", "src/index.ts");

    expect(await runGate(config, { mode: "staged" })).toEqual({
      failures: [],
      warnings: [],
    });

    expect(project.read(".runs")).toBe("run\nrun\n");
  });

  test("releases the lock of a cancelled gate and breaks a dead holder", async () => {
    const { project } = await createRepository([slowCommand]);

    project.write("src/index.ts", "export const value: number = 2;\n");

    const child = spawn(
      process.execPath,
      [getExecutable(), "gate", "--worktree"],
      {
        cwd: project.root,
        stdio: "ignore",
      },
    );

    const lock = await waitForLock(project.root);

    child.kill("SIGTERM");

    const [code, signal] = await once(child, "exit");

    expect({ code, signal }).toEqual({ code: null, signal: "SIGTERM" });
    expect(existsSync(lock)).toBe(false);

    const { pid } = spawnSync(process.execPath, ["-e", ""]);

    project.write(
      relative(project.root, lock),
      JSON.stringify({
        pid,
        token: "dead",
        label: "worktree gate",
        started: "",
      }),
    );

    expect(
      await runGate(await loadConfig(project.root), { mode: "worktree" }),
    ).toEqual({ failures: [], warnings: [] });
  });
});
