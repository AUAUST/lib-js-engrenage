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
import { captureCommandOutput } from "#tests/utils/captureCommandOutput";

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

describe("command chain", () => {
  test("passes every invocation, each argument reduced", async () => {
    const action = vi.fn<
      (invocations: readonly [string[], CommandPath][]) => void
    >();

    await run(
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
      "leaf",
      "a,b",
      "c",
      "--next",
      "d",
    ).parsing;

    expect(action).toHaveBeenCalledWith([
      [["a", "b", "c"], ["leaf"]],
      [["d"], ["leaf"]],
    ]);
  });
});
