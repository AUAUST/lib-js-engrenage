import { describe, expect, test, vi } from "vitest";

import {
  argument,
  collectListArgument,
  command,
  CommandUsageError,
  createProgram,
  option,
  type CommandDeclaration,
  type CommandPath,
} from "#nexus/cli/index";
import { runContext } from "#nexus/cli/operations/runContext";
import { captureCommandOutput } from "#tests/utils/captureCommandOutput";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { runCommand } from "#tests/utils/runCommand";

function run(declaration: CommandDeclaration, ...args: string[]) {
  const program = createProgram(
    command({ name: "program", subcommands: [declaration] }),
  );

  const output: string[] = [];

  captureCommandOutput(program, output);

  return {
    output,
    parsing: program.parseAsync(args, { from: "user" }),
  };
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

    const { parsing } = run(leaf, "leaf", "3", "--loud");

    expect(load).not.toHaveBeenCalled();

    await parsing;

    expect(load).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledWith(3, true);
  });

  test("runs the action of a command declaring nothing without parameters", async () => {
    const action = vi.fn();

    await run(
      command({ name: "leaf", action: () => Promise.resolve(action) }),
      "leaf",
    ).parsing;

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

    await expect(
      runContext.run(
        { signal: controller.signal, reporter: createTestReporter() },
        () => run(leaf, "leaf").parsing,
      ),
    ).rejects.toThrow("aborted");

    expect(action).not.toHaveBeenCalled();
  });

  test("rejects an action loader resolving to a plain object", async () => {
    const leaf = command({
      name: "leaf",
      action() {
        return Promise.resolve({ default: vi.fn() });
      },
    });

    await expect(run(leaf, "leaf").parsing).rejects.toThrow(
      new TypeError(
        "The action of the leaf command loads neither a function nor a module whose default or only export is one",
      ),
    );
  });

  test("rejects a required variadic argument given none", async () => {
    const action = vi.fn();

    const { output, parsing } = run(
      command({
        name: "leaf",
        arguments: [argument({ name: "files", variadic: true })],
        action: () => Promise.resolve(action),
      }),
      "leaf",
    );

    await expect(parsing).rejects.toMatchObject({ exitCode: 1 });

    expect(output.join("")).toContain("missing required argument 'files'");
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

    await run(leaf, "leaf", "3", "a", "--dry-run", "--extra-flag").parsing;

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

    const rejected = run(leaf, "leaf", "3", "c");

    await expect(rejected.parsing).rejects.toMatchObject({ exitCode: 1 });

    expect(rejected.output.join("")).toContain("Allowed choices are a, b.");

    const invalid = run(leaf, "leaf", "x");

    await expect(invalid.parsing).rejects.toMatchObject({ exitCode: 1 });

    expect(invalid.output.join("")).toContain("expected a number");
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

    const program = command({
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

    const created = createProgram(program);

    const output: string[] = [];

    captureCommandOutput(created, output);

    return {
      action,
      load,
      output,
      run(...args: string[]) {
        return created.parseAsync(args, { from: "user" });
      },
    };
  }

  test("loads the action of the group itself only when no subcommand is named", async () => {
    const own = vi.fn();

    const load = vi.fn(() => Promise.resolve(own));

    const leaf = vi.fn();

    const program = createProgram(
      command({
        name: "program",
        subcommands: [
          command({ name: "leaf", action: () => Promise.resolve(leaf) }),
        ],
        action: load,
      }),
    );

    await program.parseAsync(["leaf"], { from: "user" });

    expect(leaf).toHaveBeenCalledOnce();
    expect(load).not.toHaveBeenCalled();

    await program.parseAsync([], { from: "user" });

    expect(load).toHaveBeenCalledOnce();
    expect(own).toHaveBeenCalledWith();
  });

  test("loads a command's options once before it parses, and never for a sibling", async () => {
    const { action, load, run } = createLoadingProgram();

    await run("other");

    expect(load).not.toHaveBeenCalled();

    await run("leaf", "--extra");

    await run("leaf", "--extra");

    expect(load).toHaveBeenCalledOnce();

    expect(action).toHaveBeenLastCalledWith({ base: undefined, extra: true });
  });

  test.each([[["leaf", "--help"]], [["help", "leaf"]]])(
    "shows the loaded options in the help of %j",
    async (args) => {
      const { output, run } = createLoadingProgram();

      await expect(run(...args)).rejects.toMatchObject({ exitCode: 0 });

      expect(output.join("")).toContain("--extra");
    },
  );

  test("lists its help command last and loads no options for its own help", async () => {
    const { load, output, run } = createLoadingProgram();

    await expect(run("--help")).rejects.toMatchObject({
      code: "commander.helpDisplayed",
    });

    const commands = output.join("").trimEnd().split("\n");

    expect(commands.at(-1)).toMatch(
      /^\s*help \[command\.\.\.\]\s+display help for command$/u,
    );

    expect(load).not.toHaveBeenCalled();
  });

  test("rejects an unknown command name, naming the group it looked in", async () => {
    const { output, run } = createLoadingProgram();

    await expect(run("help", "nope")).rejects.toMatchObject({
      code: "commander.unknownCommand",
      exitCode: 1,
    });

    expect(output.join("")).toContain("unknown command 'nope' in 'program'");
  });

  test("shows a nested command's help as its own --help does", async () => {
    async function print(...args: string[]) {
      const { output, parsing } = run(
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

      await expect(parsing).rejects.toMatchObject({ exitCode: 0 });

      return output.join("");
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

    await expect(run(leaf, "leaf").parsing).rejects.toThrow(
      new TypeError(
        "The options of the leaf command loads neither a function nor a module whose default or only export is one",
      ),
    );
  });
});

describe("command chain", () => {
  function declareChain(
    action: (invocations: readonly [string, string][]) => void,
  ) {
    return command({
      name: "leaf",
      chain: true,
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

    expect(action).toHaveBeenCalledWith([
      ["a", "x"],
      ["b --next", "y"],
    ]);
  });

  test("passes every invocation, each argument reduced", async () => {
    const action = vi.fn<
      (invocations: readonly [string[], CommandPath][]) => void
    >();

    await runCommand(
      "leaf",
      command({
        name: "leaf",
        chain: true,
        arguments: [
          argument({
            name: "ids",
            variadic: true,
            reduce: collectListArgument,
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

    expect(action).toHaveBeenCalledWith([
      [["a", "b", "c"], ["leaf"]],
      [["d"], ["leaf"]],
    ]);
  });

  test("cannot compile to a Commander program", () => {
    expect(() => {
      return createProgram(
        command({ name: "program", subcommands: [declareChain(vi.fn())] }),
      );
    }).toThrow(
      new TypeError(
        "The leaf command chains invocations, which only nexus's engine runs",
      ),
    );
  });
});
