import { expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { readClaudeTranscript } from "#tools/agents/claude/index";
import { findModelFact, readModelFacts } from "#tools/agents/metalbrain/index";
import { readAgentRuns } from "#tools/agents/operations/readAgentRuns";
import { writeAgentRun } from "#tools/agents/operations/writeAgentRun";
import { formatAgentRuns } from "#tools/agents/utils/formatAgentRuns";
import { formatCount } from "#tools/agents/utils/formatCount";

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
  {
    type: "assistant",
    timestamp: "2026-11-12T22:12:00.000Z",
    message: {
      id: "third",
      model: "claude-haiku-5-5",
      content: [],
      usage: { ...usage, cache_read_input_tokens: 100_000 },
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
    started: "2026-11-12T22:00:00.000Z",
    ended: "2026-11-12T22:12:00.000Z",
    turns: 3,
    tools: {
      Bash: 1,
      Read: 1,
    },
    models: [
      {
        model: "claude-opus-5-5",
        tier: "standard",
        tokens: {
          input: 4,
          cacheRead: 5000,
          cacheWrite5m: 0,
          cacheWrite1h: 1000,
          output: 200,
        },
      },
      {
        model: "claude-haiku-5-5",
        tier: "long",
        tokens: {
          input: 2,
          cacheRead: 100_000,
          cacheWrite5m: 0,
          cacheWrite1h: 500,
          output: 100,
        },
      },
    ],
    startContext: 1502,
    peakContext: 100_502,
  });
});

test("loads a legacy record holding one model and its tokens", async () => {
  const tokens = {
    input: 1,
    cacheRead: 2,
    cacheWrite5m: 3,
    cacheWrite1h: 4,
    output: 5,
  };

  const legacy = {
    runtime: "claude",
    session: "session",
    agent: "agent",
    role: "worker",
    stops: 1,
    turns: 1,
    tools: {},
    tokens,
    startContext: 0,
    peakContext: 0,
  };

  const project = createTemporaryProject({
    ".ai/stats/session/agent.json": JSON.stringify({
      ...legacy,
      model: "claude-opus-5-5",
    }),
  });

  const { tokens: _, ...run } = legacy;

  await expect(readAgentRuns(project.resolve(".ai/stats"))).resolves.toEqual([
    {
      ...run,
      models: [
        {
          model: "claude-opus-5-5",
          tier: "standard",
          tokens,
        },
      ],
    },
  ]);
});

test("prices runs per model, naming the models it cannot price", async () => {
  const tokens = {
    input: 1_000_000,
    cacheRead: 0,
    cacheWrite5m: 0,
    cacheWrite1h: 0,
    output: 1_000_000,
  };

  const facts = await readModelFacts();

  const prices = facts.models["claude-sonnet-5-5"]?.tiers[0]?.prices;

  function run(agent: string, model: string) {
    return {
      runtime: "claude",
      session: "session",
      agent,
      role: "worker",
      stops: 1,
      turns: 1,
      tools: {},
      models: [
        {
          model,
          tier: "standard",
          tokens,
        },
      ],
      startContext: 0,
      peakContext: 0,
    };
  }

  const output = formatAgentRuns(
    [run("sonnet00", "claude-sonnet-5-5"), run("mystery0", "claude-mystery-1")],
    facts,
  );

  expect(output).toContain(
    "Unpriced models, left out of the cost: claude-mystery-1.",
  );

  expect(output).toMatch(/\| mystery0 \|.*\| \? \|/u);

  expect(output).toContain(
    `| sonnet00 | worker |  | claude-sonnet-5-5 | 1 | 0 | 0 | 1 | ${formatCount(6_000_000)} | $${((prices?.input ?? 0) + (prices?.output ?? 0)).toFixed(2)} |`,
  );
});

test("finds model facts through aliases and dated ids", async () => {
  const facts = await readModelFacts();

  const dated = facts.models["claude-haiku-4-5-20251001"];

  expect(findModelFact(facts, "claude-haiku-4-5")).toBe(dated);

  expect(findModelFact(facts, "claude-sonnet-5-5-20261101")).toBe(
    facts.models["claude-sonnet-5-5"],
  );

  expect(findModelFact(facts, "claude-mystery-1")).toBeUndefined();
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
