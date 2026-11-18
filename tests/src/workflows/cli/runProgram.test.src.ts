import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Command } from "@commander-js/extra-typings";

import { loadConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { mockCwd } from "#tests/utils/mockCwd";
import { reportAgentChecks } from "#tools/agents/index";
import {
  createProgram as createDefinedProgram,
  defineCommand,
  defineGroup,
  getRunContext,
} from "#workflows/cli/index";
import { runProgram } from "#workflows/cli/operations/runProgram";

import sync from "#bin/engrenage/sync";

const succeeding = defineCommand({
  action() {},
});

const failing = defineCommand({
  action() {
    throw new Error("outer", { cause: new Error("inner") });
  },
});

function createProgram() {
  return createDefinedProgram(
    "program",
    defineGroup({
      commands: { failing },
    }),
  );
}

let reporter = createTestReporter();

function run(program: Command, ...args: string[]) {
  return runProgram(program, ["node", "program", ...args], { reporter });
}

function printed() {
  return reporter.messages
    .filter(({ level }) => level === "error")
    .map(({ text }) => text)
    .join("\n");
}

beforeEach(() => {
  reporter = createTestReporter();

  mockCwd(createTemporaryProject({ "package.json": "{}" }).root);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.doUnmock("#project/config/index");
  vi.doUnmock("#workflows/config/index");

  process.exitCode = undefined;
});

describe("runProgram", () => {
  test("prints the message and its causes without a stack", async () => {
    await run(createProgram(), "failing");

    expect(printed()).toContain("outer\nCaused by: inner");
    expect(printed()).not.toContain("    at ");
    expect(process.exitCode).toBe(1);
  });

  test("runs a succeeding command without loading the config modules", async () => {
    vi.resetModules();

    vi.doMock("#project/config/index", () => {
      throw new Error("config modules loaded");
    });

    vi.doMock("#workflows/config/index", () => {
      throw new Error("config modules loaded");
    });

    const {
      runProgram: runFreshProgram,
    } = await import("#workflows/cli/operations/runProgram");

    await runFreshProgram(
      createDefinedProgram(
        "program",
        defineGroup({
          commands: { succeeding },
        }),
      ),
      ["node", "program", "succeeding"],
      { reporter },
    );

    expect(reporter.messages).toEqual([]);
    expect(process.exitCode).toBeUndefined();
  });

  test.each([
    ["--debug", "failing"],
    ["failing", "--debug"],
  ])("prints the stack with the flag (%s %s)", async (...argv) => {
    await run(createProgram(), ...argv);

    expect(printed()).toContain("    at ");
  });

  test("prints the stack with the environment variable without loading the config", async () => {
    vi.stubEnv("ENGRENAGE_DEBUG", "1");

    vi.resetModules();

    vi.doMock("#workflows/config/index", () => {
      throw new Error("config modules loaded");
    });

    const {
      runProgram: runFreshProgram,
    } = await import("#workflows/cli/operations/runProgram");

    await runFreshProgram(createProgram(), ["node", "program", "failing"], {
      reporter,
    });

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

    const findings = await reportAgentChecks(
      await loadConfig(project.root, { reporter }),
    );

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
