import { expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import {
  readClaudeAgentMeta,
  resolveClaudeAgentTranscript,
} from "#tools/agents/claude/index";
import { readRunningAgents } from "#tools/agents/operations/readRunningAgents";
import { startAgentRun } from "#tools/agents/operations/startAgentRun";

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
