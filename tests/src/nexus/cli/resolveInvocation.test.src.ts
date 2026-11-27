import { describe, expect, test, vi } from "vitest";

import {
  argument,
  command,
  CommandUsageError,
  option,
  program,
  resolveInvocation,
  type CommandDeclaration,
} from "#nexus/cli/index";

import engrenage from "#bin/engrenage/index";
import codegen from "#scripts/codegen/index";

function createLeaf(
  load = vi.fn<
    () => Promise<(count: number, note: string, loaded: unknown) => void>
  >(),
) {
  return command({
    name: "leaf",
    aliases: ["l"],
    arguments: [argument({ name: "count", parse: Number })],
    options: [
      option({
        name: "note",
        type: "string",
        required: true,
      }),
      async () => {
        return () => {
          return [option({ name: "loaded", type: "boolean" })];
        };
      },
    ],
    action: load,
    parse(count, { note }, { options }) {
      return [count, note, options.loaded];
    },
  });
}

function resolve(root: CommandDeclaration, ...args: string[]) {
  return resolveInvocation(
    program({
      root,
      scenarios: { agent: vi.fn(), json: vi.fn() },
    }),
    args,
  );
}

describe("resolveInvocation", () => {
  test("resolves the path, the action's values and the run options of any level, loading no action", async () => {
    const load = vi.fn<
      () => Promise<(count: number, note: string, loaded: unknown) => void>
    >();

    const group = command({ name: "program", subcommands: [createLeaf(load)] });

    await expect(
      resolve(
        group,
        "--quiet",
        "l",
        "3",
        "--note",
        "hi",
        "--loaded",
        "--output",
        "json",
      ),
    ).resolves.toMatchObject({
      kind: "invocation",
      path: ["leaf"],
      parameters: [3, "hi", true],
      runOptions: {
        quiet: true,
        output: "json",
        verbose: undefined,
      },
    });

    expect(load).not.toHaveBeenCalled();
  });

  test("reports every usage error the arguments hold", async () => {
    const group = command({ name: "program", subcommands: [createLeaf()] });

    const resolution = await resolve(
      group,
      "--quiet",
      "leaf",
      "--bogus",
      "--verbose",
      "--output",
      "rich",
    );

    expect(resolution).toMatchObject({ kind: "failure", path: ["leaf"] });

    expect(resolution.kind === "failure" && resolution.errors).toEqual([
      new CommandUsageError("unknown option '--bogus'"),
      new CommandUsageError(
        "option '--output <scenario>' argument 'rich' is invalid. Allowed choices are agent, json.",
      ),
      new CommandUsageError("required option '--note <value>' not specified"),
      new CommandUsageError("missing required argument 'count'"),
      new CommandUsageError(
        "option '--quiet' cannot be used with option '--verbose'",
      ),
    ]);
  });

  test("fails on an unknown command", async () => {
    const group = command({ name: "program", subcommands: [createLeaf()] });

    await expect(resolve(group, "nope")).resolves.toMatchObject({
      kind: "failure",
      errors: [new CommandUsageError("unknown command 'nope'")],
    });
  });

  test("hands a forwarding command every token after its name raw", async () => {
    await expect(
      resolveInvocation(program({ root: engrenage }), [
        "--verbose",
        "vitest",
        "--quiet",
        "--next",
      ]),
    ).resolves.toMatchObject({
      kind: "invocation",
      path: ["vitest"],
      parameters: [["--quiet", "--next"]],
      runOptions: { verbose: true, quiet: undefined },
    });
  });

  test("binds an option to the command it follows", async () => {
    const resolveCodegen = (...args: string[]) => {
      return resolveInvocation(program({ root: codegen }), args);
    };

    await expect(resolveCodegen("rules", "--check")).resolves.toMatchObject({
      kind: "invocation",
      path: ["rules"],
      parameters: [{ check: true }],
    });

    await expect(resolveCodegen("--check", "rules")).resolves.toMatchObject({
      kind: "invocation",
      path: ["rules"],
      parameters: [{ check: false }],
    });
  });

  test("takes a negative number as one argument unless every flag it spans is declared", async () => {
    const leaf = command({
      name: "leaf",
      arguments: [
        argument({
          name: "values",
          variadic: true,
          optional: true,
        }),
      ],
      options: [
        option({
          name: "one",
          type: "boolean",
          short: "1",
        }),
        option({
          name: "two",
          type: "boolean",
          short: "2",
        }),
        option({
          name: "exponent",
          type: "boolean",
          short: "e",
        }),
      ],
      action: vi.fn<() => Promise<() => void>>(),
    });

    await expect(resolve(leaf, "-13", "-1e5")).resolves.toMatchObject({
      kind: "invocation",
      parameters: [
        ["-13", "-1e5"],
        {
          one: undefined,
          two: undefined,
          exponent: undefined,
        },
      ],
    });

    await expect(resolve(leaf, "-12")).resolves.toMatchObject({
      kind: "invocation",
      parameters: [[], { one: true, two: true }],
    });
  });
});
