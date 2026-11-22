import { spawnSync } from "node:child_process";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { readHookOutput } from "#tests/utils/readHookOutput";

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

function runLint(root: string, file: string) {
  return spawnSync(
    process.execPath,
    [getExecutable("metalbrain"), "hook", "claude", "PostToolUse", "lintEdit"],
    {
      cwd: root,
      input: JSON.stringify({
        cwd: root,
        tool_name: "Edit",
        tool_input: { file_path: file },
      }),
      encoding: "utf-8",
    },
  );
}

test(
  "the lint check prints nothing for an ignored file",
  () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "node_modules/ignored.ts": "const leftover = 1;\n",
    });

    const result = runLint(
      project.root,
      project.resolve("node_modules/ignored.ts"),
    );

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe("");
  },
  binaryTimeout,
);

test(
  "a lint check failing on the config reaches the session as a notice",
  () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default { unknown: true };",
      "file.ts": "export const value = 1;\n",
    });

    const result = runLint(project.root, project.resolve("file.ts"));

    expect(result.status, result.stderr).toBe(0);

    expect(readHookOutput(result.stdout).systemMessage).toMatch(
      /^metalbrain hook claude PostToolUse lintEdit did not run, so its checks are off: .*Invalid/v,
    );
  },
  binaryTimeout,
);
