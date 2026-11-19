import { spawnSync } from "node:child_process";
import { cpSync } from "node:fs";

import { object, optional, parse, string } from "valibot";
import { afterEach, expect, test, vi } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { checkIssue } from "#tools/github/issues/contract/operations/checkIssue";
import { createProgram, runProgram } from "#workflows/cli/index";

import hook from "#bin/engrenage-hook/index";

vi.mock("#tools/github/issues/contract/operations/checkIssue", () => {
  return {
    checkIssue: vi.fn(() => {
      return Promise.reject(new Error("GitHub request failed with 503"));
    }),
  };
});

vi.mock("node:stream/consumers", () => {
  return {
    text: vi.fn(() => {
      return Promise.resolve(
        JSON.stringify({
          tool_name: "Agent",
          tool_input: { subagent_type: "worker", prompt: "Issue: o/r#1" },
        }),
      );
    }),
  };
});

vi.mock("#tools/github/issues/api/operations/resolveGithubToken", () => {
  return {
    resolveGithubToken: vi.fn(() => Promise.resolve("token")),
  };
});

const outputSchema = object({
  systemMessage: string(),
  hookSpecificOutput: optional(
    object({ hookEventName: string(), additionalContext: string() }),
  ),
});

afterEach(() => {
  process.exitCode = undefined;
  vi.restoreAllMocks();
  vi.doUnmock("#bin/engrenage-hook/claude/actions/dispatch");
});

function readOutput(stdout: string) {
  const lines = stdout.trim().split("\n");

  expect(lines).toHaveLength(1);

  return parse(outputSchema, JSON.parse(lines[0] ?? ""));
}

async function runDispatch(): Promise<unknown> {
  let failure: unknown;

  await runProgram(
    createProgram("engrenage-hook", hook),
    ["node", "engrenage-hook", "claude", "PreToolUse"],
    {
      onError(error) {
        failure = error;
      },
    },
  );

  return failure;
}

test.each(["claude", "codex"])(
  "%s PreToolUse with an invalid payload opens with a message",
  { timeout: binaryTimeout },
  (runtime) => {
    for (const input of [
      "{",
      "{}",
      '{"tool_name":"Bash","tool_input":{"command":1}}',
    ]) {
      const result = spawnSync(
        process.execPath,
        [getExecutable("engrenage-hook"), runtime, "PreToolUse"],
        { input, encoding: "utf-8" },
      );

      expect(result.status, result.stderr).toBe(0);

      expect(readOutput(result.stdout).systemMessage).toMatch(
        /^engrenage-hook /,
      );
    }
  },
);

test.each([
  [["bogus", "PreToolUse"], "unknown command 'bogus'"],
  [["claude", "Bogus"], "unknown command 'Bogus'"],
  [["claude"], "no command given"],
])(
  "usage error %j opens naming the fix",
  { timeout: binaryTimeout },
  (args, reason) => {
    const result = spawnSync(
      process.execPath,
      [getExecutable("engrenage-hook"), ...args],
      { input: "{}", encoding: "utf-8" },
    );

    expect(result.status, result.stderr).toBe(0);

    expect(readOutput(result.stdout).systemMessage).toBe(
      `engrenage-hook ${args.join(" ")} did not run, so its checks are off: ${reason}; regenerate the hooks with pnpm install, then pnpm engrenage sync`,
    );
  },
);

test("help stays a successful run", { timeout: binaryTimeout }, () => {
  const result = spawnSync(
    process.execPath,
    [getExecutable("engrenage-hook"), "--help"],
    { encoding: "utf-8" },
  );

  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toMatch(/^Usage: engrenage-hook/);
});

test(
  "an invalid consumer config opens with a message",
  { timeout: binaryTimeout },
  () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default { unknown: true };",
    });

    const result = spawnSync(
      process.execPath,
      [getExecutable("engrenage-hook"), "codex", "PreToolUse"],
      {
        input: JSON.stringify({
          cwd: project.root,
          tool_name: "spawn_agent",
          tool_input: { agent_type: "worker", message: "Issue: o/r#1" },
        }),
        encoding: "utf-8",
      },
    );

    expect(result.status, result.stderr).toBe(0);
    expect(readOutput(result.stdout).systemMessage).toContain("Invalid");
  },
);

test("a GitHub failure during dispatch reaches the fail-open handler", async () => {
  const failure = await runDispatch();

  expect(checkIssue).toHaveBeenCalled();
  expect(process.exitCode).toBeUndefined();
  expect(failure).toHaveProperty("message", "GitHub request failed with 503");
});

test("a dispatch check failing to load reaches the fail-open handler", async () => {
  vi.doMock("#bin/engrenage-hook/claude/actions/dispatch", () => {
    throw new Error("action failed to load");
  });

  const failure = await runDispatch();

  expect(process.exitCode).toBeUndefined();
  expect(failure).toHaveProperty(["cause", "message"], "action failed to load");
});

test(
  "PreToolUse output carries the failure as context too",
  { timeout: binaryTimeout },
  () => {
    const result = spawnSync(
      process.execPath,
      [getExecutable("engrenage-hook"), "claude", "PreToolUse"],
      { input: "{", encoding: "utf-8" },
    );

    const output = readOutput(result.stdout);

    expect(output.hookSpecificOutput).toEqual({
      hookEventName: "PreToolUse",
      additionalContext: output.systemMessage,
    });
  },
);

test(
  "an executable whose program fails to load opens with a message",
  { timeout: binaryTimeout },
  () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        type: "module",
        imports: {
          "#bin/*": "./bin/*.ts",
          "#workflows/*": "./workflows/*.ts",
        },
      }),
      "bin/engrenage-hook/index.ts": 'throw new Error("program is broken");\n',
      "workflows/cli/index.ts": "export function createProgram() {}\nexport function runProgram() {}\n",
    });

    cpSync(
      getExecutable("engrenage-hook"),
      project.resolve("bin/engrenage-hook/executable.ts"),
    );

    const result = spawnSync(
      process.execPath,
      [
        project.resolve("bin/engrenage-hook/executable.ts"),
        "claude",
        "PreToolUse",
      ],
      { input: "{}", encoding: "utf-8" },
    );

    expect(result.status, result.stderr).toBe(0);

    expect(readOutput(result.stdout).systemMessage).toBe(
      "engrenage-hook claude PreToolUse did not run, so its checks are off: program is broken",
    );
  },
);
