import { expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import {
  checkBudget,
  parseToolPayload,
  readBudgets,
} from "#tools/agents/metalbrain/index";

const session = "session-1";

const agent = "a1";

const stateFile = `.ai/stats/${session}/${agent}.budget.json`;

const transcriptFile = `transcripts/${session}/subagents/agent-${agent}.jsonl`;

function createTranscript(prompt: string, context: number): string {
  return [
    {
      type: "user",
      message: { role: "user", content: prompt },
    },
    {
      type: "assistant",
      message: {
        id: "msg_1",
        model: "claude-opus-5-5",
        content: [
          {
            type: "tool_use",
            id: "toolu_1",
            name: "Read",
          },
        ],
        usage: {
          input_tokens: context,
          output_tokens: 1,
        },
      },
    },
  ]
    .map((entry) => JSON.stringify(entry))
    .join("\n");
}

function runCheck(project: ReturnType<typeof createTemporaryProject>) {
  return checkBudget("standard")(
    parseToolPayload({
      session_id: session,
      transcript_path: project.resolve(`transcripts/${session}.jsonl`),
      agent_id: agent,
      agent_type: "worker",
      tool_name: "Read",
      tool_use_id: "toolu_1",
      tool_input: {},
    }),
    { root: project.root, time: 1000 },
  );
}

test("a gain reaching the budget, then each further half of it, warns once and logs it", async () => {
  const { levels } = await readBudgets();

  const budget = levels.standard;

  const project = createTemporaryProject({
    [transcriptFile]: createTranscript("Do it.", 20_000 + budget),
    [stateFile]: JSON.stringify({
      start: 20_000,
      level: "standard",
      budget,
      warnings: [],
    }),
  });

  const warning = await runCheck(project);

  expect(warning).toContain(`${budget} tokens gained past the standard budget`);
  expect(await runCheck(project)).toBeUndefined();

  project.write(
    transcriptFile,
    createTranscript("Do it.", 20_000 + 1.5 * budget),
  );

  expect(await runCheck(project)).toContain(`${1.5 * budget} tokens gained`);

  expect(JSON.parse(project.read(stateFile))).toMatchObject({
    warnings: [
      { time: new Date(1000).toISOString(), gain: budget },
      { time: new Date(1000).toISOString(), gain: 1.5 * budget },
    ],
  });
});

test("a first prompt's Budget: line sets the level over the default", async () => {
  const { levels } = await readBudgets();

  const project = createTemporaryProject({
    [transcriptFile]: createTranscript(
      "Issue: x#1\nBudget: scoped\n\nGo.",
      5000,
    ),
  });

  expect(await runCheck(project)).toBeUndefined();

  expect(JSON.parse(project.read(stateFile))).toEqual({
    start: 5000,
    level: "scoped",
    budget: levels.scoped,
    warnings: [],
  });
});
