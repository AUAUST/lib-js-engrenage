import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";

const run = promisify(execFile);

test(
  "a config using non-erasable TypeScript fails to import, naming the file and the constraint",
  { timeout: binaryTimeout },
  async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({ type: "module" }),
      "engrenage.config.ts": 'enum Unused {\n  Value = "value",\n}\n\nexport default { src: { baseline: "2026-10" } };\n',
    });

    const failure = run(
      process.execPath,
      [getExecutable(), "batiment", "map"],
      {
        cwd: project.root,
      },
    );

    await expect(failure).rejects.toMatchObject({
      stderr: expect.stringContaining(
        `Cannot import ${project.root}/engrenage.config.ts`,
      ),
    });

    await expect(failure).rejects.toMatchObject({
      stderr: expect.stringContaining("erasable TypeScript only"),
    });
  },
);
