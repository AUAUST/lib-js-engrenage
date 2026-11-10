import { writeFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGateRepository } from "#tests/utils/createGateRepository";
import { runGate } from "#workflows/gate/operations/runGate";

describe("runGate", { timeout: binaryTimeout }, () => {
  test("rejects local additions and modifications, but accepts deletions", async () => {
    const { project, git } = await createGateRepository();

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
    const { project, git } = await createGateRepository();

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
    const { project, git } = await createGateRepository();

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

  test("fails a partially staged file before any fix", async () => {
    const { project, git } = await createGateRepository();

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

  test("fails a tree edited during verification, but not for a local draft", async () => {
    const { project, git } = await createGateRepository([
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
});
