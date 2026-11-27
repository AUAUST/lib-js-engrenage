import { describe, expect, test, vi } from "vitest";
import type { Command } from "@commander-js/extra-typings";

import {
  createProgram as createDefinedProgram,
  defineChainedCommand,
  defineCommand,
  defineGroup,
  getRunContext,
} from "#nexus/cli/index";
import { runProgram } from "#nexus/cli/operations/runProgram";
import { useFailingProgram } from "#tests/utils/useFailingProgram";

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

  test("prints the stack with the program's own debug variable", async () => {
    vi.stubEnv("PROGRAM_DEBUG", "1");

    await runProgram(createProgram(), ["node", "program", "failing"], {
      reporter: getReporter(),
      debugVariable: "PROGRAM_DEBUG",
    });

    expect(printed()).toContain("    at ");
  });

  test("ignores ENGRENAGE_DEBUG for a program naming its own variable", async () => {
    vi.stubEnv("ENGRENAGE_DEBUG", "1");

    await runProgram(createProgram(), ["node", "program", "failing"], {
      reporter: getReporter(),
      debugVariable: "PROGRAM_DEBUG",
    });

    expect(printed()).not.toContain("    at ");
    expect(printed()).toContain("set PROGRAM_DEBUG=1");
  });

  test("leads its error with the explanation it is given", async () => {
    await runProgram(createProgram(), ["node", "program", "failing"], {
      reporter: getReporter(),
      explain: () => "the fix",
    });

    expect(printed()).toContain("the fix\nCaused by: outer");
  });

  test("prints nothing for a failing command under --silent", async () => {
    await run(createProgram(), "failing", "--silent");

    expect(getReporter().messages).toEqual([]);
    expect(process.exitCode).toBe(1);
  });

  test("prints a warning but not the result under --quiet", async () => {
    const program = createDefinedProgram(
      "program",
      defineGroup({
        commands: {
          reporting: defineCommand({
            action() {
              getRunContext().reporter.warn("warning");
              getRunContext().reporter.log("result");
            },
          }),
        },
      }),
    );

    await run(program, "reporting", "--quiet");

    expect(getReporter().messages.map(({ text }) => text)).toEqual(["warning"]);
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

  test("keeps --verbose of one chained invocation for the whole run", async () => {
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    const program = createDefinedProgram(
      "program",
      defineGroup({
        commands: {
          progress: defineChainedCommand({
            configure(command) {
              return command.argument("<step>");
            },
            action() {
              return Promise.resolve((steps: readonly [string][]) => {
                getRunContext().reporter.info(`progressing ${steps.join(" ")}`);
              });
            },
            parse(step) {
              return [step];
            },
          }),
        },
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
    const action = vi.fn();

    const program = createDefinedProgram(
      "program",
      defineChainedCommand({
        configure(command) {
          return command.argument("<step>");
        },
        action() {
          return Promise.resolve(action);
        },
        parse(step) {
          return [step];
        },
      }),
    );

    await run(program, "a", "--quiet", "--next", "b", "--verbose");

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
