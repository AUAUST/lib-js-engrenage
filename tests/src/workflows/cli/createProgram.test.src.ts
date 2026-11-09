import { describe, expect, test, vi } from "vitest";
import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import {
  createProgram,
  defineCommand,
  defineGroup,
  defineLazyCommand,
} from "#workflows/cli/index";

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
    const leaf = defineCommand({
      action() {},
    });

    const program = createProgram(
      "program",
      defineGroup({
        commands: {
          leaf,
          group: defineGroup({
            commands: { leaf },
          }),
        },
      }),
    );

    expect(listDebugOptions(program)).toEqual([1, 1, 1, 1]);
  });

  test("rejects a configure calling .action before any action is resolved", () => {
    const load = vi.fn(() => Promise.resolve(vi.fn()));

    const command = defineLazyCommand({
      configure(command) {
        return command.action(() => {});
      },
      action: load,
    });

    expect(() => {
      return createProgram(
        "program",
        defineGroup({
          commands: { command },
        }),
      );
    }).toThrow(
      new TypeError(
        "The configure of the command command calls .action; its definition's action runs the command",
      ),
    );

    expect(load).not.toHaveBeenCalled();
  });
});
