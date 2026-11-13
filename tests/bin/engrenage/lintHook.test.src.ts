import { spawnSync } from "node:child_process";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";

test(
  "the lint hook prints nothing for an ignored file",
  () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "node_modules/ignored.ts": "const leftover = 1;\n",
    });

    const result = spawnSync(
      process.execPath,
      [getExecutable(), "agents", "claude", "hook", "lint"],
      {
        input: JSON.stringify({
          cwd: project.root,
          tool_input: { file_path: project.resolve("node_modules/ignored.ts") },
        }),
        encoding: "utf-8",
      },
    );

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe("");
  },
  binaryTimeout,
);
