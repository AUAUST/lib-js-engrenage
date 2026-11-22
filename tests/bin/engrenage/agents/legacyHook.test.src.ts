import { spawnSync } from "node:child_process";

import { object, parse, string } from "valibot";
import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { getExecutable } from "#tests/utils/getExecutable";

test.each([{ runtime: "claude", check: "git" }])(
  "engrenage agents $runtime hook $check runs no check and asks to sync",
  { timeout: binaryTimeout },
  ({ runtime, check }) => {
    const result = spawnSync(
      process.execPath,
      [getExecutable(), "agents", runtime, "hook", check],
      {
        input: JSON.stringify({
          tool_name: "Bash",
          tool_input: { command: "git commit --no-verify -m x" },
        }),
        encoding: "utf-8",
      },
    );

    expect(result.status, result.stderr).toBe(0);

    const lines = result.stdout.trim().split("\n");

    expect(lines).toHaveLength(1);

    const {
      systemMessage,
    } = parse(object({ systemMessage: string() }), JSON.parse(lines[0] ?? ""));

    expect(systemMessage).toContain("pnpm engrenage sync");
  },
);
