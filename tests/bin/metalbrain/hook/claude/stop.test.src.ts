import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";

const transcript = JSON.stringify({
  type: "assistant",
  timestamp: "2026-11-12T22:01:00.000Z",
  message: {
    id: "first",
    model: "claude-opus-5-5",
    content: [{ type: "text", text: "Done." }],
    usage: { input_tokens: 10, output_tokens: 5 },
  },
});

function runHook(cwd: string, event: string, payload: object) {
  return spawnSync(
    process.execPath,
    [getExecutable("metalbrain"), "hook", "claude", event],
    {
      cwd,
      input: JSON.stringify(payload),
      encoding: "utf-8",
    },
  );
}

function git(cwd: string, ...args: string[]) {
  execFileSync(
    "git",
    ["-c", "user.name=Test", "-c", "user.email=test@example.com", ...args],
    { cwd, stdio: "pipe" },
  );
}

function stopSubagent(root: string, agentTranscript: string) {
  return runHook(root, "SubagentStop", {
    session_id: "session",
    transcript_path: `${root}/session.jsonl`,
    agent_id: "agent",
    agent_type: "worker",
    agent_transcript_path: agentTranscript,
  });
}

test(
  "a subagent without a transcript records nothing",
  () => {
    const project = createTemporaryProject();

    const result = stopSubagent(
      project.root,
      project.resolve("subagents/agent-agent.jsonl"),
    );

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe("");
    expect(existsSync(project.resolve(".ai/stats"))).toBe(false);
  },
  binaryTimeout,
);

test(
  "an unreadable transcript opens the hook with the error",
  () => {
    const project = createTemporaryProject({
      "subagents/agent-agent.jsonl/.keep": "",
    });

    const result = stopSubagent(
      project.root,
      project.resolve("subagents/agent-agent.jsonl"),
    );

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("EISDIR");
  },
  binaryTimeout,
);

test(
  "a linked worktree's runs and calls land under the main worktree's stats",
  () => {
    const main = createTemporaryProject();

    const linked = createTemporaryProject({ "agent.jsonl": transcript });

    git(main.root, "init", "--quiet");

    git(main.root, "commit", "--quiet", "--allow-empty", "-m", "start");

    git(main.root, "worktree", "add", "--quiet", linked.resolve("checkout"));

    const checkout = linked.resolve("checkout");

    const subagent = {
      session_id: "session",
      transcript_path: linked.resolve("session.jsonl"),
      agent_id: "agent",
      agent_type: "worker",
      agent_transcript_path: linked.resolve("agent.jsonl"),
    };

    const started = runHook(checkout, "SubagentStart", subagent);

    expect(started.status, started.stderr).toBe(0);

    expect(existsSync(main.resolve(".ai/stats/session/agent.running"))).toBe(
      true,
    );

    const called = runHook(checkout, "PostToolUse", {
      ...subagent,
      tool_name: "Bash",
      tool_use_id: "toolu_1",
      tool_input: { command: "ls" },
      tool_response: { stdout: "", stderr: "" },
    });

    expect(called.status, called.stderr).toBe(0);

    const stopped = runHook(checkout, "SubagentStop", subagent);

    expect(stopped.status, stopped.stderr).toBe(0);
    expect(stopped.stdout).toBe("");

    expect(JSON.parse(main.read(".ai/stats/session/agent.json"))).toMatchObject(
      {
        session: "session",
        agent: "agent",
        role: "worker",
        stops: 1,
      },
    );

    expect(existsSync(main.resolve(".ai/stats/session/agent.running"))).toBe(
      false,
    );

    expect(
      existsSync(main.resolve(".ai/stats/session/agent.calls.jsonl")),
    ).toBe(true);

    expect(existsSync(linked.resolve("checkout/.ai"))).toBe(false);
  },
  binaryTimeout,
);
