import { afterEach, describe, expect, test, vi } from "vitest";

import { command, program, type ProgramDeclaration } from "#nexus/cli/index";
import { nexusScenarios } from "#nexus/scenarios/index";
import { loadConfig } from "#project/config/index";
import { workflowTimeout } from "#tests/constants";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { mockCwd } from "#tests/utils/mockCwd";
import { useFailingProgram } from "#tests/utils/useFailingProgram";
import { reportAgentChecks } from "#tools/metalbrain/operations/reportAgentChecks";
import { runEngrenageProgram } from "#tools/nexus/index";

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

const succeeding = command({
  name: "succeeding",
  action: () => Promise.resolve(() => {}),
});

const { getReporter, createProgram, printed } = useFailingProgram();

function createSyncProgram(scenarios = nexusScenarios) {
  return program({
    root: command({ name: "program", subcommands: [sync] }),
    scenarios,
  });
}

function run(declared: ProgramDeclaration, ...args: string[]) {
  return runEngrenageProgram(declared, ["node", "program", ...args]);
}

afterEach(() => {
  vi.doUnmock("#project/config/index");
});

describe("sync --check", { timeout: workflowTimeout }, () => {
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

    await runEngrenageProgram(createSyncProgram(), ["node", "program", "sync"]);

    stderr.mockClear();

    await runEngrenageProgram(createSyncProgram(), [
      "node",
      "program",
      "sync",
      "--check",
    ]);

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

describe("runEngrenageProgram", () => {
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

    await run(createSyncProgram(getReporter().scenarios), "sync");

    expect(printed()).toContain("Invalid");
    expect(printed()).not.toContain("    at ");
    expect(process.exitCode).toBe(1);
  });

  test("runs a succeeding command without loading the config modules", async () => {
    vi.resetModules();

    vi.doMock("#project/config/index", () => {
      throw new Error("config modules loaded");
    });

    const {
      runEngrenageProgram: runFreshProgram,
    } = await import("#tools/nexus/index");

    await runFreshProgram(
      program({
        root: command({ name: "program", subcommands: [succeeding] }),
        scenarios: getReporter().scenarios,
      }),
      ["node", "program", "succeeding"],
    );

    expect(getReporter().messages).toEqual([]);
    expect(process.exitCode).toBeUndefined();
  });

  test("prints the stack with the environment variable without loading the config", async () => {
    vi.stubEnv("PROGRAM_DEBUG", "1");

    vi.resetModules();

    vi.doMock("#project/config/index", () => {
      throw new Error("config modules loaded");
    });

    const {
      runEngrenageProgram: runFreshProgram,
    } = await import("#tools/nexus/index");

    await runFreshProgram(createProgram(), ["node", "program", "failing"]);

    expect(printed()).toContain("    at ");
  });
});
