import { expect, test } from "vitest";

import { resolveClaudeAgentTranscript } from "#metalbrain/runtimes/index";
import { readAgentRun } from "#metalbrain/runtimes/operations/readAgentRun";
import { readClaudeAgentMeta } from "#metalbrain/runtimes/operations/readClaudeAgentMeta";
import { readRunningAgents } from "#metalbrain/runtimes/operations/readRunningAgents";
import { reconcileClaudeRuns } from "#metalbrain/runtimes/operations/reconcileClaudeRuns";
import { startAgentRun } from "#metalbrain/runtimes/operations/startAgentRun";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { findBriefedIssue } from "#tools/github/index";

test("reads running agents from JSON and legacy plain-text markers", async () => {
  const project = createTemporaryProject({
    ".ai/stats/session/legacy.running": "planner\n",
  });

  const directory = project.resolve(".ai/stats");

  const transcript = resolveClaudeAgentTranscript({
    session: "session",
    agent: "a1",
    transcript: "/projects/repo/session.jsonl",
  });

  expect(transcript).toBe("/projects/repo/session/subagents/agent-a1.jsonl");

  await startAgentRun(directory, {
    session: "session",
    agent: "a1",
    role: "worker",
    transcript,
  });

  const running = await readRunningAgents(project.resolve(".ai/stats/session"));

  expect(running.toSorted((a, b) => a.agent.localeCompare(b.agent))).toEqual([
    {
      agent: "a1",
      role: "worker",
      transcript,
    },
    {
      agent: "legacy",
      role: "planner",
    },
  ]);

  await expect(readRunningAgents(project.resolve("missing"))).resolves.toEqual(
    [],
  );
});

test("records finished runs left without a stop event and keeps unfinished ones running", async () => {
  const line = JSON.stringify({
    type: "assistant",
    timestamp: "2026-11-12T22:01:00.000Z",
    message: {
      id: "m",
      model: "claude-opus-5-5",
      content: [],
      usage: { input_tokens: 1, output_tokens: 1 },
    },
  });

  const project = createTemporaryProject({
    "subagents/agent-done.jsonl": `${line}\n`,
    "subagents/agent-done.meta.json": JSON.stringify({
      agentType: "worker",
      finished: true,
    }),
    "subagents/agent-live.jsonl": `${line}\n`,
    "subagents/agent-live.meta.json": JSON.stringify({ agentType: "worker" }),
  });

  const directory = project.resolve(".ai/stats");

  for (const agent of ["done", "live"]) {
    await startAgentRun(directory, {
      session: "session",
      agent,
      role: "worker",
      transcript: project.resolve(`subagents/agent-${agent}.jsonl`),
    });
  }

  await reconcileClaudeRuns(directory, ["session"], findBriefedIssue);

  const running = await readRunningAgents(project.resolve(".ai/stats/session"));

  expect(running.map((marker) => marker.agent)).toEqual(["live"]);

  await expect(
    readAgentRun(project.resolve(".ai/stats/session/done.json")),
  ).resolves.toMatchObject({
    agent: "done",
    role: "worker",
    stops: 0,
  });
});

test("reads the meta beside an agent transcript, keeping unknown fields", async () => {
  const project = createTemporaryProject({
    "subagents/agent-a1.meta.json": JSON.stringify({
      agentType: "worker",
      description: "Fix the parser",
      toolUseId: "toolu_1",
      spawnDepth: 1,
      finished: true,
      pickedEffortModel: "claude-opus-5-5",
    }),
  });

  await expect(
    readClaudeAgentMeta(project.resolve("subagents/agent-a1.jsonl")),
  ).resolves.toEqual({
    agentType: "worker",
    description: "Fix the parser",
    toolUseId: "toolu_1",
    spawnDepth: 1,
    finished: true,
    pickedEffortModel: "claude-opus-5-5",
  });

  await expect(
    readClaudeAgentMeta(project.resolve("subagents/agent-a2.jsonl")),
  ).resolves.toBeUndefined();
});
