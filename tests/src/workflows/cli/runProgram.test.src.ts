import { describe, expect, test, vi } from "vitest";
import type { Command } from "@commander-js/extra-typings";

import { loadConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { mockCwd } from "#tests/utils/mockCwd";
import { useFailingProgram } from "#tests/utils/useFailingProgram";
import { reportAgentChecks } from "#tools/metalbrain/operations/reportAgentChecks";
import {
  createProgram as createDefinedProgram,
  defineCommand,
  defineGroup,
  getRunContext,
} from "#workflows/cli/index";
import { runProgram } from "#workflows/cli/operations/runProgram";

import sync from "#bin/engrenage/sync";

vi.mock(
  import("#foundation/processes/operations/spawnProcess"),
  async (importOriginal) => {
    const { spawnProcess } = await importOriginal();

    const {
      resolveClaudeVersion,
    } = await import("#tests/utils/resolveClaudeVersion");

    return {
      spawnProcess: vi.fn(
        (
          command: string,
          ...rest: Parameters<typeof spawnProcess> extends [
            string,
            ...infer Rest,
          ]
            ? Rest
            : never
        ) => {
          if (command === "claude") {
            return resolveClaudeVersion();
          }

          return spawnProcess(command, ...rest);
        },
      ),
    };
  },
);

const { getReporter, createProgram, printed } = useFailingProgram();

function run(program: Command, ...args: string[]) {
  return runProgram(program, ["node", "program", ...args], {
    reporter: getReporter(),
  });
}

describe("runProgram", () => {
  test("prints the message and its causes without a stack", async () => {
    await run(createProgram(), "failing");

    expect(printed()).toContain("outer\nCaused by: inner");
    expect(printed()).not.toContain("    at ");
    expect(process.exitCode).toBe(1);
  });

  test.each([
    ["--debug", "failing"],
    ["failing", "--debug"],
  ])("prints the stack with the flag (%s %s)", async (...argv) => {
    await run(createProgram(), ...argv);

    expect(printed()).toContain("    at ");
  });

  test("prints the stack with debug in the config", async () => {
    mockCwd(
      createTemporaryProject({
        "package.json": "{}",
        "engrenage.config.ts": "export default { debug: true };",
      }).root,
    );

    await run(createProgram(), "failing");

    expect(printed()).toContain("    at ");
  });

  test("prints the validation summary of an invalid config without a stack", async () => {
    mockCwd(
      createTemporaryProject({
        "package.json": "{}",
        "engrenage.config.ts": "export default { unknown: true };",
      }).root,
    );

    await run(
      createDefinedProgram(
        "program",
        defineGroup({
          commands: { sync },
        }),
      ),
      "sync",
    );

    expect(printed()).toContain("Invalid");
    expect(printed()).not.toContain("    at ");
    expect(process.exitCode).toBe(1);
  });

  test("prints progress only with --verbose", async () => {
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    const program = () => {
      return createDefinedProgram(
        "program",
        defineGroup({
          commands: {
            progress: defineCommand({
              action() {
                getRunContext().reporter.info("progressing");
              },
            }),
          },
        }),
      );
    };

    await runProgram(program(), ["node", "program", "progress"]);

    expect(stderr.mock.calls.map(String).join("")).not.toContain("progressing");

    await runProgram(program(), ["node", "program", "progress", "--verbose"]);

    expect(stderr.mock.calls.map(String).join("")).toContain("progressing");
  });
});

describe("sync --check", () => {
  test("prints no agent finding and reports each at info", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
      "AGENTS.md": "",
      "CLAUDE.md": "",
      ".claude/settings.json": "{}",
    });

    mockCwd(project.root);

    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    const program = () => {
      return createDefinedProgram(
        "program",
        defineGroup({
          commands: { sync },
        }),
      );
    };

    await runProgram(program(), ["node", "program", "sync"]);

    stderr.mockClear();

    await runProgram(program(), ["node", "program", "sync", "--check"]);

    expect(stderr.mock.calls.map(String).join("")).not.toContain("claude · ");

    const reporter = createTestReporter();

    const config = await loadConfig(project.root, { reporter });

    const findings = await reportAgentChecks(config);

    expect(findings).not.toEqual([]);

    expect(reporter.messages).toEqual(
      findings.map(({ agent, status, message }) => {
        return {
          level: "info",
          text: `${agent} · ${status} · ${message}`,
          data: undefined,
        };
      }),
    );
  });
});
