import { spawnSync } from "node:child_process";

import { afterEach, expect, test, vi } from "vitest";

import { createProgram, runProgram } from "#nexus/cli/index";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { readHookOutput } from "#tests/utils/readHookOutput";

import metalbrain from "#bin/metalbrain/index";

vi.mock("node:stream/consumers", () => {
  return {
    text: vi.fn(() => {
      return Promise.resolve(
        JSON.stringify({
          cwd: process.cwd(),
          tool_name: "Agent",
          tool_input: { subagent_type: "worker", prompt: "Issue: o/r#1" },
        }),
      );
    }),
  };
});

afterEach(() => {
  process.exitCode = undefined;
  vi.doUnmock("#tools/metalbrain/operations/guardClaudeDispatch");
});

function runGuard(input: string, cwd?: string) {
  return spawnSync(
    process.execPath,
    [
      getExecutable("metalbrain"),
      "hook",
      "claude",
      "PreToolUse",
      "guardToolUse",
    ],
    {
      cwd,
      input,
      encoding: "utf-8",
    },
  );
}

test(
  "an invalid payload opens with a message carried as context too",
  { timeout: binaryTimeout },
  () => {
    for (const input of [
      "{",
      "{}",
      '{"tool_name":"Bash","tool_input":{"command":1}}',
    ]) {
      const result = runGuard(input);

      expect(result.status, result.stderr).toBe(0);

      const output = readHookOutput(result.stdout);

      expect(output.systemMessage).toMatch(
        /^metalbrain hook claude PreToolUse guardToolUse did not run/v,
      );

      expect(output.hookSpecificOutput).toEqual({
        hookEventName: "PreToolUse",
        additionalContext: output.systemMessage,
      });
    }
  },
);

test(
  "an invalid consumer config opens with a message",
  { timeout: binaryTimeout },
  () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default { unknown: true };",
    });

    const result = runGuard(
      JSON.stringify({
        cwd: project.root,
        tool_name: "Agent",
        tool_input: { subagent_type: "worker", prompt: "Issue: o/r#1" },
      }),
      project.root,
    );

    expect(result.status, result.stderr).toBe(0);
    expect(readHookOutput(result.stdout).systemMessage).toContain("Invalid");
  },
);

test("a dispatch guard failing to load reaches the fail-open handler", async () => {
  vi.doMock("#tools/metalbrain/operations/guardClaudeDispatch", () => {
    throw new Error("guard failed to load");
  });

  let failure: unknown;

  await runProgram(
    createProgram(metalbrain),
    ["node", "metalbrain", "hook", "claude", "PreToolUse", "guardToolUse"],
    {
      onError(error) {
        failure = error;
      },
    },
  );

  expect(process.exitCode).toBeUndefined();
  expect(failure).toHaveProperty(["cause", "message"], "guard failed to load");
});
