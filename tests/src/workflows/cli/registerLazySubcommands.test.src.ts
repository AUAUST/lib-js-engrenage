import { Command } from "@commander-js/extra-typings";
import { describe, expect, test, vi } from "vitest";

import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";

function createProgram() {
  const run = vi.fn();

  const loadGreet = vi.fn(() => {
    return Promise.resolve((command: Command) => {
      return command.option("--loud", "shout", false).action(run);
    });
  });

  const loadOther = vi.fn(() => {
    return Promise.resolve((command: Command) => {
      return command;
    });
  });

  const program = registerLazySubcommands(new Command("program"), {
    greet: {
      description: "Greet.",
      aliases: ["hello"],
      load: loadGreet,
    },
    other: {
      description: "Other.",
      load: loadOther,
    },
  });

  return {
    program,
    run,
    loadGreet,
    loadOther,
  };
}

describe("registerLazySubcommands", () => {
  test("loads only the dispatched subcommand, reached by its alias, with its options", async () => {
    const { program, run, loadGreet, loadOther } = createProgram();

    expect(program.helpInformation()).toContain("Greet.");
    expect(loadGreet).not.toHaveBeenCalled();

    await program.parseAsync(["hello", "--loud"], {
      from: "user",
    });

    expect(loadGreet).toHaveBeenCalledOnce();
    expect(loadOther).not.toHaveBeenCalled();
    expect(run.mock.calls[0]?.[0]).toEqual({ loud: true });
  });

  test("rejects a definition that returns another command than the one it receives", async () => {
    const program = registerLazySubcommands(new Command("program"), {
      detached: {
        description: "Detached.",
        load() {
          return Promise.resolve(() => {
            return new Command("detached");
          });
        },
      },
    });

    await expect(
      program.parseAsync(["detached"], {
        from: "user",
      }),
    ).rejects.toThrow("must configure the command it receives");
  });
});
