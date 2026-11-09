import { spawnSync } from "node:child_process";

import { afterEach, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { checkIssue } from "#tools/github/operations/checkIssue";
import { createProgram, runProgram } from "#workflows/cli/index";

import engrenage from "#bin/engrenage/index";

vi.mock("#tools/agents/operations/readHookPayload", () => {
  return {
    readHookPayload: vi.fn(),
  };
});

vi.mock("#tools/github/operations/checkIssue", () => {
  return {
    checkIssue: vi.fn(() => {
      return Promise.reject(new Error("GitHub request failed with 503"));
    }),
  };
});

vi.mock("#tools/github/operations/resolveGithubToken", () => {
  return {
    resolveGithubToken: vi.fn(() => Promise.resolve("token")),
  };
});

afterEach(() => {
  process.exitCode = undefined;
  vi.restoreAllMocks();
  vi.doUnmock("#bin/engrenage/agents/claude/hook/actions/dispatch");
});

function runDispatch() {
  return runProgram(createProgram("engrenage", engrenage), [
    "node",
    "engrenage",
    "agents",
    "claude",
    "hook",
    "dispatch",
  ]);
}

test.each(["claude", "codex"])(
  "%s critical payload errors exit 2",
  (provider) => {
    for (const input of ["{", "{}", '{"tool_input":{"command":1}}']) {
      const result = spawnSync(
        process.execPath,
        [getExecutable(), "agents", provider, "hook", "github"],
        { input, encoding: "utf-8" },
      );

      expect(result.status, result.stderr).toBe(2);
      expect(result.stderr).not.toBe("");
    }
  },
);

test("invalid consumer config exits 2 after hook startup", () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": "export default { unknown: true };",
  });

  const result = spawnSync(
    process.execPath,
    [getExecutable(), "agents", "codex", "hook", "dispatch"],
    {
      input: JSON.stringify({
        cwd: project.root,
        tool_name: "spawn_agent",
        tool_input: { agent_type: "worker", message: "Issue: o/r#1" },
      }),
      encoding: "utf-8",
    },
  );

  expect(result.status, result.stderr).toBe(2);
  expect(result.stderr).toContain("Invalid");
});

test("a GitHub failure after dispatch startup exits 2", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  vi.mocked(readHookPayload).mockResolvedValue({
    tool_input: { subagent_type: "worker", prompt: "Issue: o/r#1" },
  });

  await runDispatch();

  expect(checkIssue).toHaveBeenCalled();
  expect(process.exitCode).toBe(2);

  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining("GitHub request failed with 503"),
  );
});

test("a hook whose action fails to load exits 2", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  vi.doMock("#bin/engrenage/agents/claude/hook/actions/dispatch", () => {
    throw new Error("action failed to load");
  });

  await runDispatch();

  expect(process.exitCode).toBe(2);

  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining("action failed to load"),
  );
});
