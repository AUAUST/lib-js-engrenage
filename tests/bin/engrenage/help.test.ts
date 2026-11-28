import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";

const run = promisify(execFile);

test.each([
  ["engrenage", "sync [targets...]"],
  ["metalbrain", "backlog add"],
] as const)(
  "%s --help lists its commands while a config section it never reads is invalid",
  { timeout: binaryTimeout },
  async (program, listed) => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        name: "project",
        type: "module",
      }),
      "engrenage.config.ts": "export default { docs: 42 };\n",
    });

    const { stdout, stderr } = await run(
      process.execPath,
      [getExecutable(program), "--help"],
      { cwd: project.root },
    );

    expect(stdout).toContain(listed);
    expect(`${stdout}${stderr}`).not.toContain("Invalid docs config");
  },
);
