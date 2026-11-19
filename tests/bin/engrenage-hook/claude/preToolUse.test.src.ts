import { execFile } from "node:child_process";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { getExecutable } from "#tests/utils/getExecutable";

const recordResolutions = `
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, next) {
    const resolved = next(specifier, context);

    process.stderr.write(resolved.url + "\\n");

    return resolved;
  },
});
`;

function runBash(command: string) {
  return new Promise<{ status: number; stdout: string; stderr: string }>(
    (resolve) => {
      const child = execFile(
        process.execPath,
        [
          "--import",
          `data:text/javascript,${encodeURIComponent(recordResolutions)}`,
          getExecutable("engrenage-hook"),
          "claude",
          "PreToolUse",
        ],
        (_error, stdout, stderr) => {
          resolve({
            status: child.exitCode ?? 0,
            stdout,
            stderr,
          });
        },
      );

      child.stdin?.end(
        JSON.stringify({
          cwd: process.cwd(),
          tool_name: "Bash",
          tool_input: { command },
        }),
      );
    },
  );
}

test(
  "a Bash command naming neither tool loads no check",
  { timeout: binaryTimeout },
  async () => {
    const { status, stdout, stderr } = await runBash("echo ${(f)x}");

    expect(status, stderr).toBe(0);
    expect(stdout).toBe("");
    expect(stderr).not.toContain("/src/tools/agents/index.ts");
  },
);

test(
  "a Bash command bypassing the gate gets one deny",
  { timeout: binaryTimeout },
  async () => {
    const {
      status,
      stdout,
      stderr,
    } = await runBash("git commit --no-verify -m x && gh issue list");

    expect(status, stderr).toBe(0);

    const lines = stdout.trim().split("\n");

    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('"permissionDecision":"deny"');
    expect(lines[0]).toContain("gate");
  },
);
