import { afterEach, describe, expect, onTestFinished, test, vi } from "vitest";

import {
  createProgram,
  defineCommand,
  defineGroup,
  getRunContext,
  runProgram,
} from "#nexus/cli/index";
import { nexusDetectors, type ScenarioPrinters } from "#nexus/scenarios/index";
import type { Printer } from "#nexus/reports/index";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

function createRecorder() {
  const printed: string[] = [];

  function recordAs(scenario: string): () => Printer {
    return () => {
      return {
        print() {
          printed.push(scenario);
        },
      };
    };
  }

  return { printed, recordAs };
}

function createScenarios(recordAs: (scenario: string) => () => Printer) {
  return {
    agent: recordAs("agent"),
    human: recordAs("human"),
    json: recordAs("json"),
  } satisfies ScenarioPrinters;
}

function createReportingProgram(printers?: ScenarioPrinters) {
  return createProgram(
    "program",
    defineGroup({
      commands: {
        report: defineCommand({
          action() {
            getRunContext().reporter.log("result");
          },
          ...(printers !== undefined && { printers }),
        }),
      },
    }),
  );
}

describe("runProgram scenarios", () => {
  test.each([
    [[], "agent"],
    [["--output", "human"], "human"],
  ])(
    "prints under CLAUDECODE with a TTY and %j as %s",
    async (flags, scenario) => {
      vi.stubEnv("CLAUDECODE", "1");

      const { isTTY } = process.stdout;

      process.stdout.isTTY = true;

      onTestFinished(() => {
        process.stdout.isTTY = isTTY;
      });

      const { printed, recordAs } = createRecorder();

      await runProgram(
        createReportingProgram(),
        ["node", "program", "report", ...flags],
        { scenarios: createScenarios(recordAs), detectors: nexusDetectors },
      );

      expect(printed).toStrictEqual([scenario]);
    },
  );

  test("prints through the program's printer for a scenario its command binds none for", async () => {
    const { printed, recordAs } = createRecorder();

    const unused = vi.fn(recordAs("bound human"));

    await runProgram(
      createReportingProgram({ human: unused }),
      ["node", "program", "report", "--output", "json"],
      { scenarios: createScenarios(recordAs) },
    );

    expect(printed).toStrictEqual(["json"]);
    expect(unused).not.toHaveBeenCalled();
  });

  test("prints through the printer its command binds to the scenario", async () => {
    const { printed, recordAs } = createRecorder();

    await runProgram(
      createReportingProgram({ json: recordAs("bound json") }),
      ["node", "program", "report", "--output", "json"],
      { scenarios: createScenarios(recordAs) },
    );

    expect(printed).toStrictEqual(["bound json"]);
  });

  test("fails an undeclared scenario as a usage error", async () => {
    const { printed, recordAs } = createRecorder();

    const action = vi.fn();

    const program = createProgram(
      "program",
      defineGroup({
        commands: { report: defineCommand({ action }) },
      }),
    );

    await runProgram(program, ["node", "program", "report", "--output", "x"], {
      scenarios: createScenarios(recordAs),
      detectors: [() => "agent"],
    });

    expect(action).not.toHaveBeenCalled();
    expect(printed).toStrictEqual(["agent"]);
    expect(process.exitCode).toBe(1);
  });
});
