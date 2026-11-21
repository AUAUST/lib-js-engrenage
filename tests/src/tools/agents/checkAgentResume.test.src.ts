import { expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { checkAgentResume } from "#tools/agents/operations/checkAgentResume";
import { startAgentRun } from "#tools/agents/operations/startAgentRun";
import { writeAgentRun } from "#tools/agents/operations/writeAgentRun";

function usage(startContext: number, peakContext: number) {
  return {
    ended: "2026-11-15T12:00:00.000Z",
    turns: 1,
    tools: {},
    models: [],
    startContext,
    peakContext,
  };
}

async function setUp() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "consumer",
      type: "module",
      repository: "github:acme/consumer",
    }),
  });

  const config = await loadConfig(project.root);

  const directory = project.resolve(".ai/stats");

  async function record(
    agent: string,
    role: string,
    start: number,
    peak: number,
  ) {
    await writeAgentRun(directory, {
      runtime: "claude",
      session: "session",
      agent,
      role,
      ...usage(start, peak),
    });
  }

  return {
    directory,
    record,
    check(recipient: string) {
      return checkAgentResume(config, { session: "session", recipient });
    },
  };
}

test("denies resuming a consultant past its context ceiling, by id or by role", async () => {
  const { record, check } = await setUp();

  await record("c1", "consultant", 20_000, 140_000);

  for (const recipient of ["c1", "consultant", "consultant [3fa9c1]"]) {
    await expect(check(recipient)).resolves.toMatch(
      /reached 140k context, past its 100k ceiling/u,
    );
  }
});

test("passes an agent without a ceiling, a consultant under it, a running consultant and an unknown agent", async () => {
  const { directory, record, check } = await setUp();

  await record("w1", "worker", 10_000, 190_000);

  await record("p1", "planner", 30_000, 190_000);

  await record("c1", "consultant", 60_000, 100_000);

  await record("c2", "consultant", 20_000, 140_000);

  await startAgentRun(directory, {
    session: "session",
    agent: "c2",
    role: "consultant",
    transcript: "session/subagents/agent-c2.jsonl",
  });

  await expect(check("w1")).resolves.toBeUndefined();

  await expect(check("p1")).resolves.toBeUndefined();

  await expect(check("c1")).resolves.toBeUndefined();

  await expect(check("c2")).resolves.toBeUndefined();

  await expect(check("consultant")).resolves.toBeUndefined();

  await expect(check("missing")).resolves.toBeUndefined();

  await record("c2", "consultant", 20_000, 140_000);

  await expect(check("c2")).resolves.toMatch(/Start a new consultant/u);
});
