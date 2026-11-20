import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { getExecutable } from "#tests/utils/getExecutable";

function runSessionStart(environment: Record<string, string | undefined>) {
  return spawnSync(
    process.execPath,
    [getExecutable("engrenage-hook"), "claude", "SessionStart"],
    {
      input: "{}",
      encoding: "utf-8",
      env: {
        ...process.env,
        CLAUDE_ENV_FILE: undefined,
        ...environment,
      },
    },
  );
}

test(
  "makes the session's zsh leave an unmatched glob to the command, once",
  { timeout: binaryTimeout },
  () => {
    const file = join(mkdtempSync(join(tmpdir(), "session-env-")), "hook.sh");

    runSessionStart({ CLAUDE_ENV_FILE: file });

    const { status, stderr } = runSessionStart({ CLAUDE_ENV_FILE: file });

    expect(status, stderr).toBe(0);

    const script = readFileSync(file, "utf-8");

    expect(script.trim().split("\n")).toHaveLength(1);

    const output = execFileSync(
      "zsh",
      ["-c", `${script.trim()} && eval 'echo --include=*.ts'`],
      { cwd: tmpdir(), encoding: "utf-8" },
    );

    expect(output).toBe("--include=*.ts\n");
  },
);

test(
  "reports the hook off when Claude names no environment file",
  { timeout: binaryTimeout },
  () => {
    const { status, stdout } = runSessionStart({});

    expect(status).toBe(0);

    expect(stdout).toContain("CLAUDE_ENV_FILE is unset");
  },
);
