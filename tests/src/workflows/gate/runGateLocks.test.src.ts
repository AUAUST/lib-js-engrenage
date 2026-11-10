import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { relative } from "node:path";
import { setTimeout } from "node:timers/promises";

import { describe, expect, test, vi } from "vitest";

import { map } from "@auaust/primitive-kit/arrays";

import { loadConfig } from "#project/config/operations/loadConfig";
import { gateIdentity } from "#tests/constants";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGateRepository } from "#tests/utils/createGateRepository";
import { getExecutable } from "#tests/utils/getExecutable";
import { checkAgentStop } from "#workflows/gate/operations/checkAgentStop";
import { runGate } from "#workflows/gate/operations/runGate";

const slowCommand = "echo start >> .runs && sleep 1 && echo end >> .runs";

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
  test("runs simultaneous gates one after the other", async () => {
    const { project } = await createGateRepository([
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
    const { project, git } = await createGateRepository([slowCommand]);

    project.write("src/index.ts", "export const value: number = 2;\n");
    project.write(".ai/issues/1.md", "draft\n");

    const config = await loadConfig(project.root);

    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    try {
      const stop = checkAgentStop(config, gateIdentity);

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

  test("releases the lock of a cancelled gate and breaks a dead holder", async () => {
    const { project } = await createGateRepository([slowCommand]);

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
