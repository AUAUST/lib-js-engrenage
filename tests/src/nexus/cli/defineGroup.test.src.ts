import { describe, expect, test, vi } from "vitest";
import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import {
  createProgram,
  defineCommand,
  defineGroup,
  defineLazyCommand,
} from "#nexus/cli/index";

function captureOutput(command: CommandUnknownOpts, output: string[]): void {
  command.exitOverride().configureOutput({
    writeOut(text) {
      output.push(text);
    },
    writeErr(text) {
      output.push(text);
    },
  });

  for (const subcommand of command.commands) {
    captureOutput(subcommand, output);
  }
}

function createExtendedProgram() {
  const action = vi.fn();

  const extension = vi.fn((command: CommandUnknownOpts) => {
    command.option("--extra", "an extra option");
  });

  const extend = vi.fn(() => Promise.resolve(extension));

  const program = createProgram(
    "program",
    defineGroup({
      commands: {
        leaf: defineCommand({
          configure(command) {
            return command.option("--base", "an option known at registration");
          },
          action,
          extend,
        }),
        other: defineCommand({
          action() {},
        }),
      },
    }),
  );

  const output: string[] = [];

  captureOutput(program, output);

  return {
    program,
    action,
    extend,
    output,
    run(...args: string[]) {
      return program.parseAsync(args, { from: "user" });
    },
  };
}

describe("defineGroup", () => {
  test("loads the action of its lazy command only when the group itself runs", async () => {
    const action = vi.fn();

    const load = vi.fn(() => Promise.resolve(action));

    const leaf = vi.fn();

    const program = createProgram(
      "program",
      defineGroup({
        commands: {
          leaf: defineCommand({
            action: leaf,
          }),
        },
        command: defineLazyCommand({
          action: load,
        }),
      }),
    );

    await program.parseAsync(["leaf"], { from: "user" });

    expect(leaf).toHaveBeenCalledOnce();
    expect(load).not.toHaveBeenCalled();

    await program.parseAsync([], { from: "user" });

    expect(load).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledWith();
  });

  test("extends a command once before it parses, and never for a sibling", async () => {
    const { action, extend, run } = createExtendedProgram();

    await run("other");

    expect(extend).not.toHaveBeenCalled();

    await run("leaf", "--extra");

    await run("leaf", "--extra");

    expect(extend).toHaveBeenCalledOnce();

    expect(action).toHaveBeenLastCalledWith(
      expect.objectContaining({ extra: true }),
      expect.anything(),
    );
  });

  test.each([[["leaf", "--help"]], [["help", "leaf"]]])(
    "shows the extension's options in the help of %j",
    async (args) => {
      const { output, run } = createExtendedProgram();

      await expect(run(...args)).rejects.toMatchObject({
        exitCode: 0,
      });

      expect(output.join("")).toContain("--extra");
    },
  );

  test("lists its help command last and loads no extension for its own help", async () => {
    const { extend, output, run } = createExtendedProgram();

    await expect(run("--help")).rejects.toMatchObject({
      code: "commander.helpDisplayed",
    });

    const commands = output.join("").trimEnd().split("\n");

    expect(commands.at(-1)).toMatch(
      /^\s*help \[command\.\.\.\]\s+display help for command$/u,
    );

    expect(extend).not.toHaveBeenCalled();
  });

  test("rejects an unknown command name, naming the group it looked in", async () => {
    const { output, run } = createExtendedProgram();

    await expect(run("help", "nope")).rejects.toMatchObject({
      code: "commander.unknownCommand",
      exitCode: 1,
    });

    expect(output.join("")).toContain("unknown command 'nope' in 'program'");
  });

  test("shows a nested lazy command's help as its own --help does", async () => {
    function createNestedProgram() {
      const program = createProgram(
        "program",
        defineGroup({
          commands: {
            group: defineGroup({
              commands: {
                leaf: defineLazyCommand({
                  action() {
                    return Promise.resolve(() => {});
                  },
                  extend() {
                    return Promise.resolve((command: CommandUnknownOpts) => {
                      command.option("--extra", "an extra option");
                    });
                  },
                }),
              },
            }),
          },
        }),
      );

      const output: string[] = [];

      captureOutput(program, output);

      return { program, output };
    }

    async function print(...args: string[]) {
      const { program, output } = createNestedProgram();

      await expect(
        program.parseAsync(args, { from: "user" }),
      ).rejects.toMatchObject({ exitCode: 0 });

      return output.join("");
    }

    const help = await print("help", "group", "leaf");

    expect(help).toContain("--extra");
    expect(help).toBe(await print("group", "leaf", "--help"));
  });

  test("rejects an extension loader resolving to a plain object", async () => {
    const program = createProgram(
      "program",
      defineGroup({
        commands: {
          leaf: defineCommand({
            action() {},
            extend() {
              return Promise.resolve({});
            },
          }),
        },
      }),
    );

    await expect(
      program.parseAsync(["leaf"], { from: "user" }),
    ).rejects.toThrow(
      new TypeError(
        "The extension of the leaf command loads neither a function nor a module whose default or only export is one",
      ),
    );
  });
});
