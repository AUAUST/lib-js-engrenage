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
    tokens: {
      input: 0,
      cacheRead: 0,
      cacheWrite5m: 0,
      cacheWrite1h: 0,
      output: 0,
    },
    startContext,
    peakContext,
  };
}

async function setUp() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "consumer", type: "module" }),
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

test("denies resuming a planner past twice its start, by id or by role", async () => {
  const { record, check } = await setUp();

  await record("a1", "planner", 33_000, 70_000);

  for (const recipient of ["a1", "planner", "planner [3fa9c1]"]) {
    await expect(check(recipient)).resolves.toMatch(
      /grew from 33k to 70k context, past 2× its start/u,
    );
  }
});

test("passes a worker past its start, a planner under the limit, a running planner and an unknown agent", async () => {
  const { directory, record, check } = await setUp();

  await record("w1", "worker", 10_000, 90_000);

  await record("p1", "planner", 33_000, 66_000);

  await record("p2", "planner", 33_000, 70_000);

  await startAgentRun(directory, {
    session: "session",
    agent: "p2",
    role: "planner",
  });

  await expect(check("w1")).resolves.toBeUndefined();

  await expect(check("p1")).resolves.toBeUndefined();

  await expect(check("p2")).resolves.toBeUndefined();

  await expect(check("planner")).resolves.toBeUndefined();

  await expect(check("missing")).resolves.toBeUndefined();

  await record("p2", "planner", 33_000, 70_000);

  await expect(check("p2")).resolves.toMatch(/Start a new planner/u);
});
