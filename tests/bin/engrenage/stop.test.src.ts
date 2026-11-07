import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { stop } from "#bin/engrenage/agents/claude/hook/stop";
import { cacheSection } from "#project/cache/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGitRepository } from "#tests/utils/createGitRepository";
import { getExecutable } from "#tests/utils/getExecutable";
import { runCommand } from "#tests/utils/runCommand";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";

vi.mock("#tools/agents/operations/readHookPayload", () => {
  return { readHookPayload: vi.fn() };
});

const argv = process.argv;

beforeEach(() => {
  process.argv = [argv[0] ?? "node", getExecutable()];
});

afterEach(() => {
  process.argv = argv;
  vi.restoreAllMocks();
});

async function createRepository() {
  const repository = await createGitRepository(
    {
      "package.json": JSON.stringify({
        name: "project",
        type: "module",
        devDependencies: { prettier: "*" },
      }),
      "engrenage.config.ts":
        'export default { src: { baseline: "2026-10" }, agents: { gate: { commands: ["test ! -f fail"] } } };\n',
      ".gitignore": "node_modules\n",
    },
    ["prettier"],
  );

  vi.mocked(readHookPayload).mockResolvedValue({
    session_id: "session",
    agent_id: "agent",
    cwd: repository.project.root,
  });

  return repository;
}

async function runStop() {
  process.exitCode = undefined;

  const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

  await runCommand(stop);

  const exitCode = process.exitCode ?? 0;

  process.exitCode = undefined;

  return {
    exitCode,
    stderr: write.mock.calls.map(([chunk]) => String(chunk)).join(""),
  };
}

async function hasMarker(root: string): Promise<boolean> {
  const cache = await (await loadConfig(root)).resolve(cacheSection);

  const directory = join(cache.for("gate"), "stops");

  return existsSync(directory) && readdirSync(directory).length > 0;
}

describe("stop hook", { timeout: binaryTimeout }, () => {
  test("blocks the first stop on a failing tree, lets the second through and blocks again after a change", async () => {
    const { project } = await createRepository();

    project.write("fail", "first\n");

    const first = await runStop();

    expect(first.exitCode).toBe(2);
    expect(first.stderr).toContain("test ! -f fail");
    expect(first.stderr).toContain("Fix them and stop again.");
    expect(await hasMarker(project.root)).toBe(true);

    expect((await runStop()).exitCode).toBe(0);

    project.write("fail", "second\n");

    expect((await runStop()).exitCode).toBe(2);

    rmSync(project.resolve("fail"));

    expect((await runStop()).exitCode).toBe(0);
    expect(await hasMarker(project.root)).toBe(false);
  });

  test("lets a passing tree stop at once", async () => {
    const { project } = await createRepository();

    project.write("passing", "content\n");

    expect(await runStop()).toEqual({ exitCode: 0, stderr: "" });
    expect(await hasMarker(project.root)).toBe(false);
  });
});
