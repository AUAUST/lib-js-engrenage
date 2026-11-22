import { spawnSync } from "node:child_process";
import { cpSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { readHookOutput } from "#tests/utils/readHookOutput";

const openHookSource = fileURLToPath(
  import.meta.resolve("#workflows/cli/operations/openHook"),
);

test.each([
  [["bogus", "PostToolUse"], "unknown command 'bogus'"],
  [["claude", "Bogus"], "unknown command 'Bogus'"],
  [["claude"], "no command given"],
])(
  "usage error %j opens naming the fix",
  { timeout: binaryTimeout },
  (args, reason) => {
    const result = spawnSync(
      process.execPath,
      [getExecutable("engrenage-hook"), ...args],
      { input: "{}", encoding: "utf-8" },
    );

    expect(result.status, result.stderr).toBe(0);

    expect(readHookOutput(result.stdout).systemMessage).toBe(
      `engrenage-hook ${args.join(" ")} did not run, so its checks are off: ${reason}; regenerate the hooks with pnpm install, then pnpm engrenage sync`,
    );
  },
);

test("help stays a successful run", { timeout: binaryTimeout }, () => {
  const result = spawnSync(
    process.execPath,
    [getExecutable("engrenage-hook"), "--help"],
    { encoding: "utf-8" },
  );

  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toMatch(/^Usage: engrenage-hook/);
});

test(
  "an executable whose program fails to load opens with a message",
  { timeout: binaryTimeout },
  () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        type: "module",
        imports: {
          "#bin/*": "./bin/*.ts",
          "#workflows/*": "./workflows/*.ts",
        },
      }),
      "bin/engrenage-hook/index.ts": 'throw new Error("program is broken");\n',
      "workflows/cli/index.ts": `export function createProgram() {}\nexport function runProgram() {}\nexport { openHook } from ${JSON.stringify(openHookSource)};\n`,
    });

    cpSync(
      getExecutable("engrenage-hook"),
      project.resolve("bin/engrenage-hook/executable.ts"),
    );

    const result = spawnSync(
      process.execPath,
      [project.resolve("bin/engrenage-hook/executable.ts"), "claude", "Stop"],
      { input: "{}", encoding: "utf-8" },
    );

    expect(result.status, result.stderr).toBe(0);

    expect(readHookOutput(result.stdout).systemMessage).toBe(
      "engrenage-hook claude Stop did not run, so its checks are off: program is broken",
    );
  },
);
