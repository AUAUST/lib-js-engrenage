import { existsSync } from "node:fs";

import { expect, test } from "vitest";

import {
  checkThoroughness,
  parseToolPayload,
  readThoroughnessLimits,
} from "#metalbrain/runtimes/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const session = "session-1";

const agent = "a1";

const stateFile = `.ai/stats/${session}/${agent}.thoroughness.json`;

const transcriptFile = `transcripts/${session}/subagents/agent-${agent}.jsonl`;

/**
 * An assistant message as Claude Code holds it at a PreToolUse, spanning a
 * thinking and a tool use entry, then its tool result.
 */
function createMessage(id: number, context: number): object[] {
  const message = {
    id: `msg_${id}`,
    model: "claude-opus-5-5",
    usage: {
      input_tokens: 2,
      cache_read_input_tokens: context - 2,
      output_tokens: 1,
    },
  };

  return [
    {
      type: "assistant",
      message: { ...message, content: [{ type: "thinking", thinking: "" }] },
    },
    {
      type: "assistant",
      message: {
        ...message,
        content: [
          {
            type: "tool_use",
            id: `toolu_${id}`,
            name: "Read",
          },
        ],
      },
    },
    {
      type: "user",
      message: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: `toolu_${id}` }],
      },
    },
  ];
}

function createLines(entries: readonly object[]): string {
  return entries.map((entry) => `${JSON.stringify(entry)}\n`).join("");
}

/**
 * A subagent transcript as Claude Code holds it at a PreToolUse: the brief, then a
 * message and its tool result, without the message issuing the tool use under way.
 */
function createTranscript(prompt: string, context?: number): string {
  return createLines([
    {
      type: "user",
      message: { role: "user", content: prompt },
    },
    ...(context === undefined ? [] : createMessage(1, context)),
  ]);
}

function createMetaPrompt(content: string, origin?: string): object {
  return {
    type: "user",
    isMeta: true,
    ...(origin === undefined
      ? {}
      : {
          origin: { kind: origin },
        }),
    message: { role: "user", content },
  };
}

function runCheck(project: ReturnType<typeof createTemporaryProject>) {
  return checkThoroughness("standard")(
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

test("a gain reaching the token limit, then each further half of it, warns once and logs it", async () => {
  const { levels } = await readThoroughnessLimits();

  const limit = levels.standard;

  const transcript = createTranscript("Do it.", 20_000 + limit);

  const project = createTemporaryProject({
    [transcriptFile]: transcript,
    [stateFile]: JSON.stringify({
      level: "standard",
      limit,
      warnings: [],
      start: 20_000,
      opened: 0,
      scanned: Buffer.byteLength(transcript),
    }),
  });

  const warning = await runCheck(project);

  expect(warning).toContain(
    `${limit} tokens gained past the standard token limit`,
  );

  expect(warning).toContain("list what remains");
  expect(await runCheck(project)).toBeUndefined();

  project.write(
    transcriptFile,
    transcript + createLines(createMessage(2, 20_000 + 1.5 * limit)),
  );

  const repeated = await runCheck(project);

  expect(repeated).toContain(`${1.5 * limit} tokens gained`);
  expect(repeated).toContain("Warned again");

  expect(JSON.parse(project.read(stateFile))).toMatchObject({
    warnings: [
      { time: new Date(1000).toISOString(), gain: limit },
      { time: new Date(1000).toISOString(), gain: 1.5 * limit },
    ],
  });
});

test("a caller's message opens a new contact, measured from its first call", async () => {
  const { levels } = await readThoroughnessLimits();

  const limit = levels.standard;

  let transcript = createTranscript("Do it.", 5000);

  const project = createTemporaryProject({ [transcriptFile]: transcript });

  await runCheck(project);

  transcript += createLines(createMessage(2, 5000 + limit));

  project.write(transcriptFile, transcript);

  expect(await runCheck(project)).toContain(`${limit} tokens gained`);

  transcript += createLines([
    createMetaPrompt("The coordinator sent a message: go on.", "coordinator"),
    ...createMessage(3, 6000 + limit),
  ]);

  project.write(transcriptFile, transcript);

  expect(await runCheck(project)).toBeUndefined();

  project.write(
    transcriptFile,
    transcript + createLines(createMessage(4, 6000 + 2 * limit)),
  );

  expect(await runCheck(project)).toContain(`${limit} tokens gained`);

  expect(JSON.parse(project.read(stateFile))).toMatchObject({
    warnings: [{ gain: limit }, { gain: limit }],
    start: 6000 + limit,
    opened: 1,
  });
});

test("a harness reminder keeps the contact open", async () => {
  const { levels } = await readThoroughnessLimits();

  const limit = levels.standard;

  const transcript = createTranscript("Do it.", 5000);

  const project = createTemporaryProject({ [transcriptFile]: transcript });

  await runCheck(project);

  project.write(
    transcriptFile,
    transcript +
      createLines([
        createMetaPrompt("<system-reminder>Hand back.</system-reminder>"),
        ...createMessage(2, 5000 + limit),
      ]),
  );

  expect(await runCheck(project)).toContain(`${limit} tokens gained`);
});

test("a first prompt's Thoroughness: line sets the level over the default", async () => {
  const { levels } = await readThoroughnessLimits();

  const project = createTemporaryProject({
    [transcriptFile]: createTranscript(
      "Issue: x#1\nThoroughness: scoped\n\nGo.",
      5000,
    ),
  });

  expect(await runCheck(project)).toBeUndefined();

  expect(JSON.parse(project.read(stateFile))).toEqual({
    level: "scoped",
    limit: levels.scoped,
    warnings: [],
    start: 5000,
    opened: 0,
    scanned: Buffer.byteLength(
      createTranscript("Issue: x#1\nThoroughness: scoped\n\nGo.", 5000),
    ),
  });
});

test("a Thoroughness: level ending a prose line sets the level", async () => {
  const project = createTemporaryProject({
    [transcriptFile]: createTranscript(
      "Fix it. Report the paths. Thoroughness: scoped.",
      5000,
    ),
  });

  await runCheck(project);

  expect(JSON.parse(project.read(stateFile))).toMatchObject({
    level: "scoped",
  });
});

test("quoted placeholders, Thoroughness stop: and quoted levels yield to the brief's own line", async () => {
  const project = createTemporaryProject({
    [transcriptFile]: createTranscript(
      "Thoroughness: scoped\n\nQuote `Thoroughness: <level>` and `Thoroughness stop:`; brief it `Thoroughness: standard` later.",
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
    [transcriptFile]: createTranscript("Thoroughness: scoped\n\nGo."),
  });

  expect(await runCheck(project)).toBeUndefined();
  expect(existsSync(project.resolve(stateFile))).toBe(false);
});
