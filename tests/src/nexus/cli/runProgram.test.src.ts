import { describe, expect, test, vi } from "vitest";

import {
  argument,
  command,
  CommandUsageError,
  program as declareProgram,
  getRunContext,
  option,
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

function createStepProgram(action: (steps: readonly [string][]) => void) {
  return declareProgram({
    root: command({
      name: "program",
      chain: true,
      arguments: [argument({ name: "step" })],
      action: () => Promise.resolve(action),
      parse(step, _invocation) {
        return [step];
      },
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

  test("prints the stack with the debug variable named after its root", async () => {
    vi.stubEnv("PROGRAM_DEBUG", "1");

    await run(createProgram(), "failing");

    expect(printed()).toContain("    at ");
  });

  test("ignores another program's debug variable, naming its own in the hint", async () => {
    vi.stubEnv("ENGRENAGE_DEBUG", "1");

    await run(createProgram(), "failing");

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
      { path: [], report: expect.any(Function) },
    );

    expect(process.exitCode).toBeUndefined();
  });

  test("hands onError the resolved command path and the default report", async () => {
    let path: unknown;

    await runProgram(createProgram(), ["node", "program", "failing"], {
      onError(_error, failure) {
        ({ path } = failure);

        return failure.report();
      },
    });

    expect(path).toEqual(["failing"]);
    expect(printed()).toContain("outer");
    expect(process.exitCode).toBe(1);
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

    const program = declareProgram({
      root: command({
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
    });

    await run(program, "progress", "a", "--verbose", "--next", "progress", "b");

    expect(stderr.mock.calls.map(String).join("")).toContain("progressing a b");
  });

  test("rejects verbosity flags set by two chained invocations", async () => {
    const action = vi.fn<(steps: readonly [string][]) => void>();

    const program = createStepProgram(action);

    await run(program, "a", "--quiet", "--next", "b", "--verbose");

    expect(printed()).toBe(
      "invocation 2: option '--verbose' cannot be used with option '--quiet'",
    );

    expect(action).not.toHaveBeenCalled();
  });

  describe("timings", () => {
    function createTimedProgram() {
      return createGroupProgram("timed", () => {
        const start = performance.now();

        performance.measure("work:step", { start });
        performance.measure("work", { start });

        getRunContext().reporter.complete("done");
      });
    }

    function readTimings() {
      return getReporter().messages.filter(({ text }) => {
        return text === "Timings" || text.startsWith("  ");
      });
    }

    test("prints each phase and the action's own measures under --quiet with --timings", async () => {
      await run(createTimedProgram(), "timed", "--quiet", "--timings");

      const rows = readTimings().map(({ text }) => {
        return text.trim().split(/\s{2,}/u)[0];
      });

      expect(rows).toEqual([
        "Timings",
        "startup",
        "layer loading",
        "routing",
        "validation",
        "action loading",
        "execution",
        "work",
        "step",
      ]);

      expect(
        readTimings().find(({ text }) => {
          return text.trimStart().startsWith("step");
        })?.text,
      ).toMatch(/^ {4}step/u);
    });

    test("prints them at debug alone, and never under --silent", async () => {
      await run(createTimedProgram(), "timed");

      expect(readTimings()).toEqual([]);

      await run(createTimedProgram(), "timed", "--debug");

      expect(readTimings()[0]).toMatchObject({
        level: "debug",
        text: "Timings",
      });

      const before = getReporter().messages.length;

      await run(createTimedProgram(), "timed", "--silent", "--timings");

      expect(getReporter().messages).toHaveLength(before);
    });

    test("names each chained invocation's phases after it", async () => {
      const action = vi.fn<(steps: readonly [string][]) => void>();

      const program = createStepProgram(action);

      await run(program, "a", "--timings", "--next", "b");

      expect(printed()).toMatch(
        /^ {2}invocation 2 .*\n {4}layer loading .*\n {4}routing /mu,
      );
    });
  });

  describe("chaining", () => {
    function createChainProgram(action: (notes: readonly [string][]) => void) {
      const load = vi.fn(() => Promise.resolve(action));
      const show = vi.fn(() => Promise.resolve(() => {}));

      const declared = declareProgram({
        root: command({
          name: "program",
          subcommands: [
            command({
              name: "add",
              chain: true,
              options: [
                option({
                  name: "text",
                  type: "string",
                  required: true,
                }),
              ],
              action: load,
              parse({ text = "" }, _invocation) {
                return [text];
              },
            }),
            command({ name: "show", action: show }),
          ],
        }),
        scenarios: getReporter().scenarios,
      });

      return {
        declared,
        load,
        show,
      };
    }

    test("runs nothing when a later invocation fails, naming it", async () => {
      const { declared, load } = createChainProgram(vi.fn());

      await run(declared, "add", "--text", "a", "--next", "add", "--nope");

      expect(printed()).toBe(
        "invocation 2: unknown option '--nope'\ninvocation 2: required option '--text <value>' not specified",
      );

      expect(load).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    test("takes --next as an option's value only when written inline", async () => {
      const action = vi.fn<(notes: readonly [string][]) => void>();

      const { declared } = createChainProgram(action);

      await run(
        declared,
        "add",
        "--text=--next",
        "--next",
        "add",
        "--text",
        "b",
      );

      expect(action).toHaveBeenCalledWith([["--next"], ["b"]]);
    });

    test("rejects an invocation naming no command path or another command", async () => {
      const { declared, load, show } = createChainProgram(vi.fn());

      await run(
        declared,
        "add",
        "--text",
        "a",
        "--next",
        "--text",
        "b",
        "--next",
        "show",
      );

      expect(printed()).toContain("invocation 2: unknown option '--text'");

      expect(printed()).toContain(
        "invocation 3: command 'program show' cannot be chained",
      );

      expect(load).not.toHaveBeenCalled();
      expect(show).not.toHaveBeenCalled();
    });

    test("rejects a command declaring --next", async () => {
      const declared = declareProgram({
        root: command({
          name: "program",
          options: [option({ name: "next", type: "boolean" })],
          action: () => Promise.resolve(() => {}),
        }),
      });

      const onError = vi.fn();

      await runProgram(declared, ["node", "program"], { onError });

      expect(onError).toHaveBeenCalledWith(
        new TypeError(
          "The program command declares the --next option, which nexus reserves to separate invocations",
        ),
        { path: undefined, report: expect.any(Function) },
      );
    });
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
