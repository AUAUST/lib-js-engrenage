import { spawnSync } from "node:child_process";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";

test(
  "the output limit notices a shell output past it",
  () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default { agents: { outputLimit: 10 } };",
    });

    const result = spawnSync(
      process.execPath,
      [
        getExecutable("metalbrain"),
        "hook",
        "claude",
        "PostToolUse",
        "limitOutput",
      ],
      {
        cwd: project.root,
        input: JSON.stringify({
          cwd: project.root,
          tool_name: "Bash",
          tool_input: { command: "cat big.log" },
          tool_response: { stdout: "x".repeat(20), stderr: "" },
        }),
        encoding: "utf-8",
      },
    );

    expect(result.status, result.stderr).toBe(0);

    expect(JSON.parse(result.stdout)).toEqual({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: expect.stringContaining("past the 10 output limit"),
      },
    });
  },
  binaryTimeout,
);
