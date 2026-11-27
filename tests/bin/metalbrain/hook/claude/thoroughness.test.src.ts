import { spawnSync } from "node:child_process";

import { expect, test } from "vitest";

import { readThoroughnessLimits } from "#metalbrain/runtimes/index";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";

const session = "session-1";

const agent = "a1";

test(
  "a thoroughness warning adds context and leaves the permission decision to Claude Code",
  async () => {
    const { levels } = await readThoroughnessLimits();

    const limit = levels.standard;

    const context = 20_000 + limit;

    const transcript = [
      {
        type: "user",
        message: { role: "user", content: "Do it." },
      },
      {
        type: "assistant",
        message: {
          id: "msg_1",
          model: "claude-opus-5-5",
          usage: {
            input_tokens: 2,
            cache_read_input_tokens: context - 2,
            output_tokens: 1,
          },
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
    ]
      .map((entry) => `${JSON.stringify(entry)}\n`)
      .join("");

    const project = createTemporaryProject({
      [`transcripts/${session}/subagents/agent-${agent}.jsonl`]: transcript,
      [`.ai/stats/${session}/${agent}.thoroughness.json`]: JSON.stringify({
        level: "standard",
        limit,
        warnings: [],
        start: 20_000,
        opened: 0,
        scanned: Buffer.byteLength(transcript),
      }),
    });

    const result = spawnSync(
      process.execPath,
      [
        getExecutable("metalbrain"),
        "hook",
        "claude",
        "thoroughness",
        "--level",
        "standard",
      ],
      {
        cwd: project.root,
        input: JSON.stringify({
          session_id: session,
          transcript_path: project.resolve(`transcripts/${session}.jsonl`),
          agent_id: agent,
          agent_type: "worker",
          tool_name: "Bash",
          tool_use_id: "toolu_2",
          tool_input: {},
        }),
        encoding: "utf-8",
      },
    );

    expect(result.status, result.stderr).toBe(0);

    expect(JSON.parse(result.stdout)).toEqual({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: expect.stringContaining(
          `${limit} tokens gained past the standard token limit`,
        ),
      },
    });
  },
  binaryTimeout,
);
