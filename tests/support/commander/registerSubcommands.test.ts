import { Command } from "@commander-js/extra-typings";
import { describe, expect, test, vi } from "vitest";

import { defineCommand } from "#support/commander/utils/defineCommand";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

describe("registerSubcommands", () => {
  test("names each subcommand after its record key", async () => {
    const run = vi.fn();

    const greet = defineCommand((command) => {
      return command.action(run);
    });

    const program = registerSubcommands(new Command("program"), {
      greet,
    });

    await program.parseAsync(["greet"], {
      from: "user",
    });

    expect(program.commands.map((command) => command.name())).toEqual([
      "greet",
    ]);
    expect(run).toHaveBeenCalledOnce();
  });

  test("returns the parent to keep chaining", () => {
    const program = new Command("program");

    expect(registerSubcommands(program, {})).toBe(program);
  });
});
