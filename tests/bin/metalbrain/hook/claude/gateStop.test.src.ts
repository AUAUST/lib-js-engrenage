import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { text } from "node:stream/consumers";

import { literal, object, parse, string } from "valibot";
import { afterEach, describe, expect, test, vi } from "vitest";

import { createProgram, runProgram } from "#nexus/cli/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGitRepository } from "#tests/utils/createGitRepository";

import metalbrain from "#bin/metalbrain/index";

const blockSchema = object({ decision: literal("block"), reason: string() });

vi.mock("node:stream/consumers", () => {
  return { text: vi.fn() };
});

afterEach(() => {
  vi.restoreAllMocks();
});

function setPayload(payload: object) {
  vi.mocked(text).mockResolvedValue(JSON.stringify(payload));
}

async function createRepository() {
  const repository = await createGitRepository(
    {
      "package.json": JSON.stringify({
        name: "project",
        type: "module",
        devDependencies: { prettier: "*" },
      }),
      "engrenage.config.ts": 'export default { environments: { src: { execution: { syntax: "2026-10" } } }, agents: { gate: { commands: ["test ! -f fail"] } } };\n',
      ".gitignore": "node_modules\n",
    },
    ["prettier"],
  );

  setPayload({
    session_id: "session",
    agent_id: "agent",
    cwd: repository.project.root,
  });

  return repository;
}

async function runStop(): Promise<{ block?: string; output: string }> {
  const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);

  write.mockClear();

  let failure: unknown;

  await runProgram(
    createProgram("metalbrain", metalbrain),
    ["node", "metalbrain", "hook", "claude", "Stop", "gateStop"],
    {
      onError(error) {
        failure = error;
      },
    },
  );

  expect(failure).toBeUndefined();

  const output = write.mock.calls.map(([chunk]) => String(chunk)).join("");

  write.mockRestore();

  if (output === "") {
    return { output };
  }

  return { block: parse(blockSchema, JSON.parse(output)).reason, output };
}

async function hasMarker(root: string): Promise<boolean> {
  const cache = await (await loadConfig(root)).resolve("cache");

  const directory = join(cache.for("gate"), "stops");

  return existsSync(directory) && readdirSync(directory).length > 0;
}

describe("stop gate", { timeout: binaryTimeout }, () => {
  test("blocks the first stop on a failing tree, lets the second through and blocks again after a change", async () => {
    const { project } = await createRepository();

    project.write("fail", "first\n");

    const { block } = await runStop();

    expect(block).toContain("test ! -f fail");

    expect(block).toContain(
      "If you must stop now, list these failures in your report and stop again without changing any file:",
    );

    expect(await hasMarker(project.root)).toBe(true);

    expect((await runStop()).block).toBeUndefined();

    project.write("fail", "second\n");

    expect((await runStop()).block).toBeDefined();

    rmSync(project.resolve("fail"));

    expect((await runStop()).block).toBeUndefined();
    expect(await hasMarker(project.root)).toBe(false);
  });

  test("gates the session's own stop only while it runs a gated agent", async () => {
    const { project } = await createRepository();

    project.write("fail", "content\n");

    const session = { session_id: "session", cwd: project.root };

    setPayload(session);

    expect((await runStop()).block).toBeUndefined();

    setPayload({ ...session, agent_type: "Explore" });

    expect((await runStop()).block).toBeUndefined();

    setPayload({ ...session, agent_type: "debugger" });

    expect((await runStop()).block).toBeDefined();
  });

  test("lets a passing tree stop at once", async () => {
    const { project } = await createRepository();

    project.write("passing", "content\n");

    expect(await runStop()).toEqual({ output: "" });
    expect(await hasMarker(project.root)).toBe(false);
  });
});
