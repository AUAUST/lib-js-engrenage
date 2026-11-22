import { existsSync } from "node:fs";

import { expect, test } from "vitest";

import {
  logToolCall,
  parseToolPayload,
  recordCallStart,
} from "#metalbrain/runtimes/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const session = "session-1";

const toolUse = "toolu_2";

function createTranscript(model: string): string {
  return [
    {
      type: "assistant",
      message: {
        id: "msg_1",
        model,
        content: [
          {
            type: "tool_use",
            id: "toolu_1",
            name: "Read",
          },
        ],
        usage: {
          input_tokens: 10,
          cache_read_input_tokens: 1000,
          cache_creation_input_tokens: 0,
          output_tokens: 50,
        },
      },
    },
    {
      type: "user",
      message: {
        content: [{ type: "tool_result", tool_use_id: "toolu_1" }],
      },
    },
    {
      type: "assistant",
      message: {
        id: "msg_2",
        model,
        content: [{ type: "thinking", thinking: "" }],
        usage: { input_tokens: 20, output_tokens: 5 },
      },
    },
    {
      type: "assistant",
      message: {
        id: "msg_2",
        model,
        content: [
          {
            type: "tool_use",
            id: toolUse,
            name: "Bash",
          },
        ],
        usage: {
          input_tokens: 20,
          cache_read_input_tokens: 1000,
          cache_creation_input_tokens: 500,
          cache_creation: {
            ephemeral_5m_input_tokens: 0,
            ephemeral_1h_input_tokens: 500,
          },
          output_tokens: 100,
          speed: "standard",
        },
      },
    },
  ]
    .map((entry) => JSON.stringify(entry))
    .join("\n");
}

async function runPair(
  project: ReturnType<typeof createTemporaryProject>,
): Promise<unknown[]> {
  const payload = {
    session_id: session,
    transcript_path: project.resolve(`transcripts/${session}.jsonl`),
    tool_name: "Bash",
    tool_use_id: toolUse,
    tool_input: { command: "ls" },
  };

  await recordCallStart(parseToolPayload(payload), {
    root: project.root,
    time: 1000,
  });

  await logToolCall(
    parseToolPayload({
      ...payload,
      tool_response: { stdout: "a\nb\n", stderr: "" },
    }),
    { root: project.root, time: 1250 },
  );

  return project
    .read(`.ai/stats/${session}/main.calls.jsonl`)
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}

test("a PreToolUse then PostToolUse pair logs the call priced from the transcript", async () => {
  const project = createTemporaryProject({
    [`transcripts/${session}.jsonl`]: createTranscript("claude-opus-5-5"),
  });

  expect(await runPair(project)).toEqual([
    {
      start: new Date(1000).toISOString(),
      end: new Date(1250).toISOString(),
      duration: 250,
      session,
      agent: "main",
      role: "main",
      tool: "Bash",
      command: "ls",
      result: {
        characters: 4,
        lines: 2,
      },
      message: {
        model: "claude-opus-5-5",
        tier: "standard",
        tokens: {
          input: 20,
          cacheWrite5m: 0,
          cacheWrite1h: 500,
          cacheRead: 1000,
          output: 100,
        },
        context: 1520,
        contextGain: 510,
        cost: (20 * 4 + 500 * 8 + 1000 * 0.2 + 100 * 20) / 1_000_000,
      },
    },
  ]);

  expect(
    existsSync(project.resolve(`.ai/stats/${session}/starts/${toolUse}`)),
  ).toBe(false);
});

test("an unknown model logs the call unpriced", async () => {
  const project = createTemporaryProject({
    [`transcripts/${session}.jsonl`]: createTranscript("claude-unknown-1"),
  });

  const [call] = await runPair(project);

  expect(call).toMatchObject({
    message: {
      model: "claude-unknown-1",
      tier: null,
      cost: null,
    },
  });
});

test("a missing transcript logs the call without its message", async () => {
  const project = createTemporaryProject();

  const [call] = await runPair(project);

  expect(call).toMatchObject({ duration: 250, tool: "Bash" });
  expect(call).not.toHaveProperty("message");
});
