import { afterEach, describe, expect, test, vi } from "vitest";

import { useFailingProgram } from "#tests/utils/useFailingProgram";
import {
  createProgram as createDefinedProgram,
  defineCommand,
  defineGroup,
} from "#workflows/cli/index";

const succeeding = defineCommand({
  action() {},
});

const { getReporter, createProgram, printed } = useFailingProgram();

afterEach(() => {
  vi.doUnmock("#project/config/index");
  vi.doUnmock("#workflows/config/index");
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
      { reporter: getReporter() },
    );

    expect(getReporter().messages).toEqual([]);
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
      reporter: getReporter(),
    });

    expect(printed()).toContain("    at ");
  });
});
