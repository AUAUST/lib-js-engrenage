import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";

function runRecord(root: string, agentTranscript: string) {
  return spawnSync(
    process.execPath,
    [getExecutable("engrenage-hook"), "claude", "SubagentStop"],
    {
      cwd: root,
      input: JSON.stringify({
        cwd: root,
        session_id: "session",
        transcript_path: `${root}/session.jsonl`,
        agent_id: "agent",
        agent_type: "worker",
        agent_transcript_path: agentTranscript,
      }),
      encoding: "utf-8",
    },
  );
}

test("a subagent without a transcript records nothing", () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
  });

  const result = runRecord(
    project.root,
    project.resolve("subagents/agent-agent.jsonl"),
  );

  expect(result.status, result.stderr).toBe(0);
  expect(result.stderr).toBe("");
  expect(existsSync(project.resolve(".ai/stats"))).toBe(false);
});

test("an unreadable transcript opens the hook with the error", () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "subagents/agent-agent.jsonl/.keep": "",
  });

  const result = runRecord(
    project.root,
    project.resolve("subagents/agent-agent.jsonl"),
  );

  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain("EISDIR");
});
