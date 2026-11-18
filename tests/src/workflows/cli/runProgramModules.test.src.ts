import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { mockCwd } from "#tests/utils/mockCwd";
import {
  createProgram as createDefinedProgram,
  defineCommand,
  defineGroup,
} from "#workflows/cli/index";

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

describe("runProgram without the config modules", () => {
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
});
