import { expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { readClaudeTranscript } from "#tools/agents/claude/index";
import { readAgentRuns } from "#tools/agents/operations/readAgentRuns";
import { writeAgentRun } from "#tools/agents/operations/writeAgentRun";

const usage = {
  input_tokens: 2,
  output_tokens: 100,
  cache_read_input_tokens: 1000,
  cache_creation_input_tokens: 500,
  cache_creation: {
    ephemeral_5m_input_tokens: 0,
    ephemeral_1h_input_tokens: 500,
  },
};

const transcript = [
  {
    type: "user",
    timestamp: "2026-11-12T22:00:00.000Z",
    message: { content: "Issue: AUAUST/lib-js-toolkit#204\n\nBrief." },
  },
  {
    type: "assistant",
    timestamp: "2026-11-12T22:01:00.000Z",
    message: {
      id: "first",
      model: "claude-opus-5-5",
      content: [
        {
          type: "tool_use",
          id: "a",
          name: "Bash",
        },
      ],
      usage,
    },
  },
  {
    type: "assistant",
    timestamp: "2026-11-12T22:01:00.000Z",
    message: {
      id: "first",
      model: "claude-opus-5-5",
      content: [
        {
          type: "tool_use",
          id: "b",
          name: "Read",
        },
      ],
      usage,
    },
  },
  {
    type: "assistant",
    message: {
      id: "synthetic",
      model: "<synthetic>",
      content: [],
      usage: { ...usage, output_tokens: 9999 },
    },
  },
  {
    type: "assistant",
    timestamp: "2026-11-12T22:10:00.000Z",
    message: {
      id: "second",
      model: "claude-opus-5-5",
      content: [{ type: "text", text: "Done." }],
      usage: { ...usage, cache_read_input_tokens: 4000 },
    },
  },
]
  .map((entry) => JSON.stringify(entry))
  .join("\n");

test("summarizes a transcript once per message, skipping synthetic ones and torn lines", async () => {
  const project = createTemporaryProject({
    "agent.jsonl": `${transcript}\n{"type":"assist`,
  });

  await expect(
    readClaudeTranscript(project.resolve("agent.jsonl")),
  ).resolves.toEqual({
    issue: "AUAUST/lib-js-toolkit#204",
    model: "claude-opus-5-5",
    started: "2026-11-12T22:00:00.000Z",
    ended: "2026-11-12T22:10:00.000Z",
    turns: 2,
    tools: {
      Bash: 1,
      Read: 1,
    },
    tokens: {
      input: 4,
      cacheRead: 5000,
      cacheWrite5m: 0,
      cacheWrite1h: 1000,
      output: 200,
    },
    startContext: 1502,
    peakContext: 4502,
  });
});

test("rewrites an agent's record on each stop, counting its stops", async () => {
  const project = createTemporaryProject({ "agent.jsonl": transcript });

  const directory = project.resolve(".ai/stats");

  const run = {
    runtime: "claude",
    session: "session",
    agent: "agent",
    role: "worker",
    ...(await readClaudeTranscript(project.resolve("agent.jsonl"))),
  };

  await writeAgentRun(directory, run);

  await writeAgentRun(directory, run);

  await expect(readAgentRuns(directory)).resolves.toEqual([
    { ...run, stops: 2 },
  ]);

  await expect(readAgentRuns(project.resolve("missing"))).resolves.toEqual([]);
});
