import { describe, expect, test, vi } from "vitest";
import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { argument, command, createProgram } from "#nexus/cli/index";

function listDebugOptions(command: CommandUnknownOpts): number[] {
  return [
    command.options.filter(({ long }) => long === "--debug").length,
    ...command.commands
      .filter((subcommand) => subcommand.name() !== "help")
      .flatMap(listDebugOptions),
  ];
}

describe("createProgram", () => {
  test("gives every command of a nested group one --debug option", () => {
    const leaf = command({
      name: "leaf",
      action: () => {
        return Promise.resolve(() => {});
      },
    });

    const program = createProgram(
      command({
        name: "program",
        subcommands: [leaf, command({ name: "group", subcommands: [leaf] })],
      }),
    );

    expect(listDebugOptions(program)).toEqual([1, 1, 1, 1]);
  });

  test("refuses a chaining command", () => {
    const leaf = command({
      name: "leaf",
      chain: true,
      arguments: [argument({ name: "word" })],
      action: () => {
        return Promise.resolve(vi.fn<(words: readonly [string][]) => void>());
      },
      parse(word, _invocation) {
        return [word];
      },
    });

    expect(() => {
      return createProgram(command({ name: "program", subcommands: [leaf] }));
    }).toThrow(
      new TypeError(
        "The leaf command chains invocations, which only nexus's engine runs",
      ),
    );
  });
});
