import { expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { readClaudeTranscript } from "#tools/agents/claude/index";
import { findModelFact, readModelFacts } from "#tools/agents/metalbrain/index";
import { readAgentRuns } from "#tools/agents/operations/readAgentRuns";
import { writeAgentRun } from "#tools/agents/operations/writeAgentRun";
import { findCommandFamily } from "#tools/agents/utils/findCommandFamily";
import { formatAgentAggregate } from "#tools/agents/utils/formatAgentAggregate";
import { formatAgentRuns } from "#tools/agents/utils/formatAgentRuns";
import { formatCount } from "#tools/agents/utils/formatCount";
import { summarizeAgentCalls } from "#tools/agents/utils/summarizeAgentCalls";

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

  const read = await readClaudeTranscript(project.resolve("agent.jsonl"));

  expect(summarizeAgentCalls(read)).toMatchObject({
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
        calls: 2,
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
        calls: 1,
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

test("breaks a transcript down per tool result, cache gap and compaction", async () => {
  const toolTranscript = [
    {
      type: "assistant",
      timestamp: "2026-11-12T22:00:00.000Z",
      message: {
        id: "first",
        model: "claude-opus-5-5",
        content: [
          {
            type: "tool_use",
            id: "bash",
            name: "Bash",
            input: { command: "gh issue view 1" },
          },
          {
            type: "tool_use",
            id: "read",
            name: "Read",
            input: { file_path: "src/x.ts" },
          },
        ],
        usage: {
          ...usage,
          output_tokens_details: { thinking_tokens: 40 },
        },
      },
    },
    {
      type: "user",
      timestamp: "2026-11-12T22:00:01.000Z",
      message: {
        content: [
          {
            type: "tool_result",
            tool_use_id: "bash",
            content: "x".repeat(300),
          },
          {
            type: "tool_result",
            tool_use_id: "read",
            content: [{ type: "text", text: "y".repeat(50) }],
          },
        ],
      },
    },
    {
      type: "system",
      subtype: "compact_boundary",
      timestamp: "2026-11-12T22:03:00.000Z",
      compactMetadata: {
        trigger: "auto",
        preTokens: 150_000,
        postTokens: 20_000,
      },
    },
    {
      type: "assistant",
      timestamp: "2026-11-12T22:07:00.000Z",
      message: {
        id: "second",
        model: "claude-opus-5-5",
        content: [{ type: "text", text: "Done." }],
        usage: { ...usage, cache_read_input_tokens: 600 },
      },
    },
  ]
    .map((entry) => JSON.stringify(entry))
    .join("\n");

  const project = createTemporaryProject({ "agent.jsonl": toolTranscript });

  const summary = summarizeAgentCalls(
    await readClaudeTranscript(project.resolve("agent.jsonl")),
  );

  expect(summary).toMatchObject({
    results: {
      "Bash: gh issue view": { count: 1, chars: 300 },
      "Read": { count: 1, chars: 50 },
    },
    batched: 1,
    gaps: {
      under1m: 0,
      upTo5m: 0,
      upTo60m: 1,
      over60m: 0,
    },
    ttl5m: {
      count: 1,
      tokens: 600,
    },
    misses: {
      count: 1,
      tokens: 900,
    },
    thinking: 40,
    compactions: [
      {
        at: "2026-11-12T22:03:00.000Z",
        trigger: "auto",
        before: 150_000,
        after: 20_000,
      },
    ],
  });
});

test("names a shell command's family after its leading bare words", () => {
  expect(
    findCommandFamily("Bash", "cd /x && pnpm engrenage gate --worktree | tail"),
  ).toBe("Bash: pnpm engrenage gate");
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
          calls: 0,
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
          calls: 1,
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
    `| sonnet00 | worker |  | claude-sonnet-5-5 | 1 | 0 | 0 | 1 | 0% | 0 | 0 (0) | ${formatCount(6_000_000)} | $${((prices?.input ?? 0) + (prices?.output ?? 0)).toFixed(2)} |`,
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
    ...summarizeAgentCalls(
      await readClaudeTranscript(project.resolve("agent.jsonl")),
    ),
  };

  await writeAgentRun(directory, run);

  await writeAgentRun(directory, run);

  await expect(readAgentRuns(directory)).resolves.toEqual([
    { ...run, stops: 2 },
  ]);

  await expect(readAgentRuns(project.resolve("missing"))).resolves.toEqual([]);
});

test("aggregates runs of several sessions by role, model and day", async () => {
  const tokens = {
    input: 0,
    cacheRead: 0,
    cacheWrite5m: 0,
    cacheWrite1h: 0,
    output: 1000,
  };

  function run(session: string, role: string, model: string, started: string) {
    return {
      runtime: "claude",
      session,
      agent: `${session}-${role}`,
      role,
      stops: 1,
      started,
      turns: 1,
      tools: {},
      models: [
        {
          model,
          tier: "standard",
          calls: 2,
          tokens,
        },
      ],
      startContext: 0,
      peakContext: 0,
    };
  }

  const output = formatAgentAggregate(
    [
      run("first", "worker", "claude-opus-5-5", "2026-11-18T10:00:00.000Z"),
      run("first", "merger", "claude-sonnet-5-5", "2026-11-18T11:00:00.000Z"),
      run("second", "worker", "claude-sonnet-5-5", "2026-11-19T09:00:00.000Z"),
    ],
    await readModelFacts(),
  );

  expect(output).toMatch(/\| worker \| 2 \| 4 \|/u);

  expect(output).toMatch(/\| merger \| 1 \| 2 \|/u);

  expect(output).toMatch(/\| claude-sonnet-5-5 \| 2 \| 4 \|/u);

  expect(output).toMatch(/\| claude-opus-5-5 \| 1 \| 2 \|/u);

  expect(output).toMatch(/\| 2026-11-18 \| 2 \| 4 \|/u);

  expect(output).toMatch(/\| 2026-11-19 \| 1 \| 2 \|/u);
});
