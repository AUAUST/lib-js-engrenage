import { afterEach, describe, expect, onTestFinished, test, vi } from "vitest";

import { command, getRunContext, program, runProgram } from "#nexus/cli/index";
import {
  nexusDetectors,
  type ScenarioDetector,
  type ScenarioPrinters,
} from "#nexus/scenarios/index";
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

function createReportingProgram(
  scenarios: ScenarioPrinters,
  {
    printers,
    detectors = nexusDetectors,
  }: {
    printers?: ScenarioPrinters;
    detectors?: readonly ScenarioDetector[];
  } = {},
) {
  return program({
    root: command({
      name: "program",
      subcommands: [
        command({
          name: "report",
          action() {
            return Promise.resolve(() => {
              getRunContext().reporter.log("result");
            });
          },
          ...(printers !== undefined && { printers }),
        }),
      ],
    }),
    scenarios,
    detectors,
  });
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

      await runProgram(createReportingProgram(createScenarios(recordAs)), [
        "node",
        "program",
        "report",
        ...flags,
      ]);

      expect(printed).toStrictEqual([scenario]);
    },
  );

  test("prints through the program's printer for a scenario its command binds none for", async () => {
    const { printed, recordAs } = createRecorder();

    const unused = vi.fn(recordAs("bound human"));

    await runProgram(
      createReportingProgram(createScenarios(recordAs), {
        printers: { human: unused },
      }),
      ["node", "program", "report", "--output", "json"],
    );

    expect(printed).toStrictEqual(["json"]);
    expect(unused).not.toHaveBeenCalled();
  });

  test("prints through the printer its command binds to the scenario", async () => {
    const { printed, recordAs } = createRecorder();

    await runProgram(
      createReportingProgram(createScenarios(recordAs), {
        printers: { json: recordAs("bound json") },
      }),
      ["node", "program", "report", "--output", "json"],
    );

    expect(printed).toStrictEqual(["bound json"]);
  });

  test("fails an undeclared scenario as a usage error", async () => {
    const { printed, recordAs } = createRecorder();

    const declared = createReportingProgram(createScenarios(recordAs), {
      detectors: [() => "agent"],
    });

    await runProgram(declared, ["node", "program", "report", "--output", "x"]);

    expect(printed).toStrictEqual(["agent"]);
    expect(process.exitCode).toBe(1);
  });
});
