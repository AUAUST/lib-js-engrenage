import { existsSync } from "node:fs";

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

/**
 * A subagent transcript as Claude Code holds it at a PreToolUse: the brief, then
 * a message spanning a thinking and a tool use entry, then its tool result,
 * without the message issuing the tool use under way.
 */
function createTranscript(prompt: string, context?: number): string {
  const message = {
    id: "msg_1",
    model: "claude-opus-5-5",
    usage: {
      input_tokens: 2,
      cache_read_input_tokens: context === undefined ? 0 : context - 2,
      output_tokens: 1,
    },
  };

  return [
    {
      type: "user",
      message: { role: "user", content: prompt },
    },
    ...(context === undefined
      ? []
      : [
          {
            type: "assistant",
            message: {
              ...message,
              content: [{ type: "thinking", thinking: "" }],
            },
          },
          {
            type: "assistant",
            message: {
              ...message,
              content: [
                {
                  type: "tool_use",
                  id: "toolu_1",
                  name: "Read",
                },
              ],
            },
          },
          {
            type: "user",
            message: {
              role: "user",
              content: [{ type: "tool_result", tool_use_id: "toolu_1" }],
            },
          },
        ]),
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
      tool_name: "Bash",
      tool_use_id: "toolu_2",
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

test("a Budget: level ending a prose line sets the level", async () => {
  const project = createTemporaryProject({
    [transcriptFile]: createTranscript(
      "Fix it. Report the paths. Budget: scoped.",
      5000,
    ),
  });

  await runCheck(project);

  expect(JSON.parse(project.read(stateFile))).toMatchObject({
    level: "scoped",
  });
});

test("quoted placeholders, Budget stop: and quoted levels yield to the brief's own line", async () => {
  const project = createTemporaryProject({
    [transcriptFile]: createTranscript(
      "Budget: scoped\n\nQuote `Budget: <level>` and `Budget stop:`; brief it `Budget: standard` later.",
      5000,
    ),
  });

  await runCheck(project);

  expect(JSON.parse(project.read(stateFile))).toMatchObject({
    level: "scoped",
  });
});

test("a transcript without an assistant message yet waits for one", async () => {
  const project = createTemporaryProject({
    [transcriptFile]: createTranscript("Budget: scoped\n\nGo."),
  });

  expect(await runCheck(project)).toBeUndefined();
  expect(existsSync(project.resolve(stateFile))).toBe(false);
});
