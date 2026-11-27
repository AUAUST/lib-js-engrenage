import { describe, expect, test, vi } from "vitest";

import {
  argument,
  command,
  CommandUsageError,
  option,
  program,
  type CommandDeclaration,
  type CommandPath,
} from "#nexus/cli/index";
import { runProgram } from "#nexus/cli/operations/runProgram";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { runCommand } from "#tests/utils/runCommand";
import { runDefinition } from "#tests/utils/runDefinition";

function run(declaration: CommandDeclaration, ...args: string[]) {
  return runDefinition(
    command({ name: "program", subcommands: [declaration] }),
    ...args,
  );
}

function printed(reporter: ReturnType<typeof createTestReporter>): string {
  return reporter.messages.map(({ text }) => text).join("\n");
}

describe("command", () => {
  test("loads its action only when it runs, with the values parse returns", async () => {
    const action = vi.fn();

    const load = vi.fn(() => Promise.resolve(action));

    const leaf = command({
      name: "leaf",
      arguments: [argument({ name: "count", parse: Number })],
      options: [
        option({
          name: "loud",
          type: "boolean",
          default: false,
        }),
      ],
      action: load,
      parse(count, { loud }, _invocation) {
        return [count, loud];
      },
    });

    const running = run(leaf, "leaf", "3", "--loud");

    expect(load).not.toHaveBeenCalled();

    await running;

    expect(load).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledWith(3, true);
  });

  test("runs the action of a command declaring nothing without parameters", async () => {
    const action = vi.fn();

    await run(
      command({ name: "leaf", action: () => Promise.resolve(action) }),
      "leaf",
    );

    expect(action.mock.calls).toEqual([[]]);
  });

  test("requires parse when the declared values do not fit the action", () => {
    command({
      name: "leaf",
      arguments: [argument({ name: "count" })],
      // @ts-expect-error the action takes a number, the argument declares a string
      action() {
        return Promise.resolve((count: number) => count);
      },
    });

    command({
      name: "leaf",
      // @ts-expect-error a command declaring nothing passes no options
      action() {
        return Promise.resolve((options: { loud: boolean }) => options);
      },
    });
  });

  test("never starts an action whose run was aborted while it loaded", async () => {
    const controller = new AbortController();

    const action = vi.fn();

    const leaf = command({
      name: "leaf",
      action() {
        controller.abort(new Error("aborted"));

        return Promise.resolve(action);
      },
    });

    await runProgram(
      program({
        root: command({ name: "program", subcommands: [leaf] }),
        scenarios: createTestReporter().scenarios,
      }),
      ["node", "program", "leaf"],
      { signal: controller.signal },
    );

    expect(action).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  test("rejects an action loader resolving to a plain object", async () => {
    const leaf = command({
      name: "leaf",
      action() {
        return Promise.resolve({ default: vi.fn() });
      },
    });

    await expect(run(leaf, "leaf")).rejects.toThrow(
      new TypeError(
        "The action of the leaf command loads neither a function nor a module whose default or only export is one",
      ),
    );
  });

  test("rejects a required variadic argument given none", async () => {
    const action = vi.fn();

    await expect(
      run(
        command({
          name: "leaf",
          arguments: [argument({ name: "files", variadic: true })],
          action: () => Promise.resolve(action),
        }),
        "leaf",
      ),
    ).rejects.toThrow(
      new CommandUsageError("missing required argument 'files'"),
    );

    expect(action).not.toHaveBeenCalled();
  });

  test("passes values keyed by option name, loaded options and choices to parse", async () => {
    const action = vi.fn();

    const paths: CommandPath[] = [];

    const leaf = command({
      name: "leaf",
      arguments: [
        argument({
          name: "count",
          parse(value) {
            if (Number.isNaN(Number(value))) {
              throw new CommandUsageError("expected a number");
            }

            return Number(value);
          },
        }),
        argument({
          name: "targets",
          optional: true,
          variadic: true,
          choices: () => Promise.resolve(() => ["a", "b"]),
        }),
      ],
      options: [
        option({
          name: "dry-run",
          type: "boolean",
          default: false,
        }),
        () => {
          return Promise.resolve((path: CommandPath) => {
            paths.push(path);

            return [option({ name: "extra-flag", type: "boolean" })];
          });
        },
      ],
      action: () => Promise.resolve(action),
      parse(count, targets, options, invocation) {
        return [count, targets, options, invocation];
      },
    });

    await run(leaf, "leaf", "3", "a", "--dry-run", "--extra-flag");

    expect(paths).toEqual([["leaf"]]);

    expect(action).toHaveBeenCalledWith(
      3,
      ["a"],
      {
        "dry-run": true,
      },
      {
        path: ["leaf"],
        options: { "dry-run": true, "extra-flag": true },
      },
    );

    await expect(run(leaf, "leaf", "3", "c")).rejects.toThrow(
      "Allowed choices are a, b.",
    );

    await expect(run(leaf, "leaf", "x")).rejects.toThrow("expected a number");
  });
});

describe("command subcommands", () => {
  function createLoadingProgram() {
    const action = vi.fn();

    const load = vi.fn(() => {
      return Promise.resolve(() => {
        return [
          option({
            name: "extra",
            type: "boolean",
            description: "an extra option",
          }),
        ];
      });
    });

    const root = command({
      name: "program",
      subcommands: [
        command({
          name: "leaf",
          options: [
            option({
              name: "base",
              type: "boolean",
              description: "an option known at registration",
            }),
            load,
          ],
          action: () => Promise.resolve(action),
          parse(_options, { options }) {
            return [options];
          },
        }),
        command({ name: "other", action: () => Promise.resolve(() => {}) }),
      ],
    });

    return {
      action,
      load,
      run(...args: string[]) {
        return runDefinition(root, ...args);
      },
    };
  }

  test("loads the action of the group itself only when no subcommand is named", async () => {
    const own = vi.fn();

    const load = vi.fn(() => Promise.resolve(own));

    const leaf = vi.fn();

    const root = command({
      name: "program",
      subcommands: [
        command({ name: "leaf", action: () => Promise.resolve(leaf) }),
      ],
      action: load,
    });

    await runDefinition(root, "leaf");

    expect(leaf).toHaveBeenCalledOnce();
    expect(load).not.toHaveBeenCalled();

    await runDefinition(root);

    expect(load).toHaveBeenCalledOnce();
    expect(own).toHaveBeenCalledWith();
  });

  test("loads a command's options once before it parses, and never for a sibling", async () => {
    const { action, load, run } = createLoadingProgram();

    await run("other");

    expect(load).not.toHaveBeenCalled();

    await run("leaf", "--extra");

    expect(load).toHaveBeenCalledOnce();

    expect(action).toHaveBeenLastCalledWith({ base: undefined, extra: true });
  });

  test.each([[["leaf", "--help"]], [["help", "leaf"]]])(
    "shows the loaded options in the help of %j",
    async (args) => {
      const { run } = createLoadingProgram();

      expect(printed(await run(...args))).toContain("--extra");
    },
  );

  test("rejects an unknown command name in a help path", async () => {
    const { run } = createLoadingProgram();

    await expect(run("help", "nope")).rejects.toThrow(
      new CommandUsageError("unknown command 'nope'"),
    );
  });

  test("shows a nested command's help as its own --help does", async () => {
    async function print(...args: string[]) {
      const reporter = await run(
        command({
          name: "group",
          subcommands: [
            command({
              name: "leaf",
              options: [
                () => {
                  return Promise.resolve(() => {
                    return [
                      option({
                        name: "extra",
                        type: "boolean",
                        description: "an extra option",
                      }),
                    ];
                  });
                },
              ],
              action: () => Promise.resolve(() => {}),
            }),
          ],
        }),
        ...args,
      );

      return printed(reporter);
    }

    const help = await print("help", "group", "leaf");

    expect(help).toContain("--extra");
    expect(help).toBe(await print("group", "leaf", "--help"));
  });

  test("rejects an options loader resolving to a plain object", async () => {
    const leaf = command({
      name: "leaf",
      options: [() => Promise.resolve({})],
      action: () => Promise.resolve(() => {}),
    });

    await expect(run(leaf, "leaf")).rejects.toThrow(
      new TypeError(
        "The options of the leaf command loads neither a function nor a module whose default or only export is one",
      ),
    );
  });
});

describe("command chain", () => {
  function declareChain(action: (words: string, note: string) => void) {
    return command({
      name: "leaf",
      arguments: [argument({ name: "words", variadic: true })],
      options: [
        option({
          name: "note",
          type: "string",
          required: true,
        }),
      ],
      action: () => Promise.resolve(action),
      parse(words, { note }, _invocation) {
        return [words.join(" "), note];
      },
    });
  }

  test("keeps --next after -- in the last invocation", async () => {
    const action = vi.fn();

    await runCommand(
      "leaf",
      declareChain(action),
      "a",
      "--note",
      "x",
      "--next",
      "leaf",
      "b",
      "--note",
      "y",
      "--",
      "--next",
    );

    expect(action.mock.calls).toEqual([
      ["a", "x"],
      ["b --next", "y"],
    ]);
  });

  test("runs every invocation, each argument split", async () => {
    const action = vi.fn<(ids: string[], path: CommandPath) => void>();

    await runCommand(
      "leaf",
      command({
        name: "leaf",
        arguments: [
          argument({
            name: "ids",
            variadic: true,
            separator: ",",
          }),
        ],
        action: () => Promise.resolve(action),
        parse(ids, { path }) {
          return [ids, path];
        },
      }),
      "a,b",
      "c",
      "--next",
      "leaf",
      "d",
    );

    expect(action.mock.calls).toEqual([
      [["a", "b", "c"], ["leaf"]],
      [["d"], ["leaf"]],
    ]);
  });
});
