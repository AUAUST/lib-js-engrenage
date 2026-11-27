import { describe, expect, test } from "vitest";
import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { command, createProgram } from "#nexus/cli/index";

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
});
