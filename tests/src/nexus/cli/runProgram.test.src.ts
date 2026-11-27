import { describe, expect, test, vi } from "vitest";

import {
  argument,
  command,
  CommandUsageError,
  createProgram as createDefinedProgram,
  program as declareProgram,
  getRunContext,
  type ProgramDeclaration,
} from "#nexus/cli/index";
import { runProgram } from "#nexus/cli/operations/runProgram";
import { useFailingProgram } from "#tests/utils/useFailingProgram";

const { getReporter, createProgram, printed } = useFailingProgram();

function createGroupProgram(name: string, action: () => void) {
  return declareProgram({
    root: command({
      name: "program",
      subcommands: [command({ name, action: () => Promise.resolve(action) })],
    }),
    scenarios: getReporter().scenarios,
  });
}

function run(program: ProgramDeclaration, ...args: string[]) {
  return runProgram(program, ["node", "program", ...args]);
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

  test("prints the stack with the program's own debug variable", async () => {
    vi.stubEnv("PROGRAM_DEBUG", "1");

    await runProgram(createProgram(), ["node", "program", "failing"], {
      debugVariable: "PROGRAM_DEBUG",
    });

    expect(printed()).toContain("    at ");
  });

  test("ignores ENGRENAGE_DEBUG for a program naming its own variable", async () => {
    vi.stubEnv("ENGRENAGE_DEBUG", "1");

    await runProgram(createProgram(), ["node", "program", "failing"], {
      debugVariable: "PROGRAM_DEBUG",
    });

    expect(printed()).not.toContain("    at ");
    expect(printed()).toContain("set PROGRAM_DEBUG=1");
  });

  test("leads its error with the explanation it is given", async () => {
    await runProgram(createProgram(), ["node", "program", "failing"], {
      explain: () => "the fix",
    });

    expect(printed()).toContain("the fix\nCaused by: outer");
  });

  test("prints a usage error alone and loads no action", async () => {
    const action = vi.fn(() => Promise.resolve(() => {}));

    const program = declareProgram({
      root: command({
        name: "program",
        subcommands: [command({ name: "loaded", action })],
      }),
      scenarios: getReporter().scenarios,
    });

    await run(program, "loaded", "--nope");

    expect(printed()).toBe("unknown option '--nope'");
    expect(action).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  test("hands a usage error to onError, setting no exit code", async () => {
    const onError = vi.fn();

    await runProgram(createProgram(), ["node", "program", "nope"], {
      onError,
    });

    expect(onError).toHaveBeenCalledWith(
      new CommandUsageError("unknown command 'nope'"),
    );

    expect(process.exitCode).toBeUndefined();
  });

  test("prints a group's help when no command is named", async () => {
    await run(createProgram());

    expect(getReporter().messages[0]).toMatchObject({ level: "error" });
    expect(printed()).toContain("failing");
    expect(printed()).toContain("no command given");
    expect(process.exitCode).toBe(1);
  });

  test("prints nothing for a failing command under --silent", async () => {
    await run(createProgram(), "failing", "--silent");

    expect(getReporter().messages).toEqual([]);
    expect(process.exitCode).toBe(1);
  });

  test("prints a warning but not the result under --quiet", async () => {
    const program = createGroupProgram("reporting", () => {
      getRunContext().reporter.warn("warning");
      getRunContext().reporter.log("result");
    });

    await run(program, "reporting", "--quiet");

    expect(getReporter().messages.map(({ text }) => text)).toEqual(["warning"]);
  });

  test("prints the completion line with the run's total time under --quiet", async () => {
    const program = createGroupProgram("completing", () => {
      getRunContext().reporter.log("result");
      getRunContext().reporter.complete("done");
    });

    await run(program, "completing", "--quiet");

    expect(getReporter().entries).toEqual([
      {
        kind: "completion",
        text: "done",
        duration: expect.any(Number),
      },
    ]);
  });

  test.each([
    ["--quiet", "failing", "--verbose"],
    ["--silent", "failing", "--debug"],
  ])("rejects two verbosity flags (%s %s %s)", async (...argv) => {
    await run(createProgram(), ...argv);

    expect(printed()).toContain("cannot be used with option");
    expect(printed()).not.toContain("outer");
    expect(process.exitCode).toBe(1);
  });

  test("prints progress only with --verbose", async () => {
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    const program = () => {
      return declareProgram({
        root: command({
          name: "program",
          subcommands: [
            command({
              name: "progress",
              action: () => {
                return Promise.resolve(() => {
                  getRunContext().reporter.info("progressing");
                });
              },
            }),
          ],
        }),
      });
    };

    await runProgram(program(), ["node", "program", "progress"]);

    expect(stderr.mock.calls.map(String).join("")).not.toContain("progressing");

    await runProgram(program(), ["node", "program", "progress", "--verbose"]);

    expect(stderr.mock.calls.map(String).join("")).toContain("progressing");
  });

  test("keeps --verbose of one chained invocation for the whole run", async () => {
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    const program = createDefinedProgram(
      command({
        name: "program",
        subcommands: [
          command({
            name: "progress",
            chain: true,
            arguments: [argument({ name: "step" })],
            action() {
              return Promise.resolve((steps: readonly [string][]) => {
                getRunContext().reporter.info(`progressing ${steps.join(" ")}`);
              });
            },
            parse(step, _invocation) {
              return [step];
            },
          }),
        ],
      }),
    );

    await runProgram(program, [
      "node",
      "program",
      "progress",
      "a",
      "--verbose",
      "--next",
      "b",
    ]);

    expect(stderr.mock.calls.map(String).join("")).toContain("progressing a b");
  });

  test("rejects verbosity flags set by two chained invocations", async () => {
    const action = vi.fn<(steps: readonly [string][]) => void>();

    const program = createDefinedProgram(
      command({
        name: "program",
        chain: true,
        arguments: [argument({ name: "step" })],
        action: () => Promise.resolve(action),
        parse(step, _invocation) {
          return [step];
        },
      }),
    );

    await runProgram(
      program,
      ["node", "program", "a", "--quiet", "--next", "b", "--verbose"],
      { scenarios: getReporter().scenarios },
    );

    expect(printed()).toContain(
      "invocation 2: option '--quiet' cannot be used with option '--verbose'",
    );

    expect(action).not.toHaveBeenCalled();
  });

  test.each([
    ["stdout", process.stdout],
    ["stderr", process.stderr],
  ])("ends quietly once %s's reader closes", async (_name, stream) => {
    await run(createProgram(), "failing");

    const closed = Object.assign(new Error("write EPIPE"), { code: "EPIPE" });

    expect(() => {
      return stream.emit("error", closed);
    }).not.toThrow();

    expect(process.exitCode).toBe(1);
  });

  test("still raises other errors of its output streams", async () => {
    await run(createProgram(), "failing");

    const failure = Object.assign(new Error("write EIO"), { code: "EIO" });

    expect(() => {
      return process.stdout.emit("error", failure);
    }).toThrow(failure);
  });
});
