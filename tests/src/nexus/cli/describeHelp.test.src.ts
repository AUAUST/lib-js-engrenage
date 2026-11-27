import { describe, expect, test, vi } from "vitest";

import {
  command,
  CommandUsageError,
  describeHelp,
  helpEntry,
  option,
  program,
  resolveInvocation,
  type CommandDeclaration,
  type CommandPath,
  type ProgramDeclaration,
} from "#nexus/cli/index";
import { runContext } from "#nexus/cli/operations/runContext";
import { createReporter, renderDenseEntry } from "#nexus/reports/index";

import metalbrain from "#bin/metalbrain/index";

const scenarios = { agent: vi.fn(), json: vi.fn() };

function createLogs(load: () => Promise<() => void>) {
  const add = command({
    name: "add",
    options: [
      option({
        name: "keywords",
        type: "string",
        placeholder: "terms",
      }),
      async () => {
        return (path: CommandPath) => {
          return [
            option({
              name: path.at(-2) === "friction" ? "tried" : "need",
              type: "string",
              placeholder: "text",
              required: true,
            }),
          ];
        };
      },
    ],
    action: load,
  });

  const tap = command({
    name: "tap",
    aliases: ["t"],
    action: load,
  });

  return command({
    name: "records",
    subcommands: [
      command({ name: "friction", subcommands: [add, tap] }),
      command({ name: "missing", subcommands: [add, tap] }),
      command({ name: "pending", subcommands: [add] }),
    ],
  });
}

async function printHelp(
  declared: ProgramDeclaration,
  ...args: string[]
): Promise<string> {
  const resolution = await resolveInvocation(declared, args);

  if (resolution.kind !== "help") {
    throw new Error(`${args.join(" ")} requests no help`);
  }

  const contract = await runContext.run(
    {
      signal: new AbortController().signal,
      reporter: createReporter({ print() {} }),
    },
    () => {
      return describeHelp(declared, resolution);
    },
  );

  return renderDenseEntry(helpEntry(contract)).join("\n");
}

function resolve(root: CommandDeclaration, ...args: string[]) {
  return resolveInvocation(program({ root, scenarios }), args);
}

describe("describeHelp", () => {
  test("lists each declaration once with every path mounting it, sibling groups folded and loaded options under their paths, loading no action", async () => {
    const load = vi.fn<() => Promise<() => void>>();

    const help = await printHelp(
      program({ root: createLogs(load), scenarios }),
      "help",
    );

    expect(help).toContain("{friction,missing,pending} <command>");
    expect(help).toContain("{friction,missing} tap (aliases: t)");

    expect(help).toMatch(
      /^\{friction,missing,pending\} add \[options\]\n {2}--keywords <terms>\n {2}friction add: *\n {4}--tried <text> +\(required\)\n {2}\{missing,pending\} add: *\n {4}--need <text> +\(required\)$/mu,
    );

    expect(help).toContain(
      "--output <scenario>  print for the output scenario <scenario> instead of the detected one (choices: agent, json)",
    );

    expect(help).toMatch(/^help \[path\.\.\.\]/mu);
    expect(load).not.toHaveBeenCalled();
  });

  test("renders the help of a path as its --help does, through aliases", async () => {
    const declared = program({ root: createLogs(vi.fn()), scenarios });

    const help = await printHelp(declared, "help", "friction", "t");

    expect(help).toBe(await printHelp(declared, "friction", "tap", "--help"));
    expect(help).toMatch(/^friction tap \(aliases: t\)$/mu);
    expect(help).not.toContain("add");
  });

  test("states each log's own fields under the shared add of metalbrain", async () => {
    const help = await printHelp(program({ root: metalbrain }), "help");

    expect(help).toContain("{friction,discarded,pending,missing} <command>");
    expect(help).toMatch(/^ {2}friction add:\n {4}--subject <text>/mu);

    expect(help).toMatch(
      /^\{friction,discarded,pending,missing\} add \[options\] {2}Add an entry and print its ID\. {2}\(chains\)\n {2}--keywords .*\n {2}friction add:/mu,
    );

    expect(help).toMatch(/^ {2}--next +start another invocation/mu);

    expect(help).toContain(
      "Chaining: <command path> <arguments> --next <command path> <arguments>",
    );

    expect(help).toMatch(
      /^ {2}missing add:\n(?: {4}.*\n)*? {4}--instead <text>/mu,
    );
  });

  test("states the separator of an argument and an option", async () => {
    const help = await printHelp(program({ root: metalbrain }), "help");

    expect(help).toMatch(
      /^ {2}<ids\.\.\.> +the entries' IDs \(separated by ","\)$/mu,
    );

    expect(help).toMatch(
      /^ {2}--keywords <keywords> +.*\(repeatable; separated by ","\)$/mu,
    );
  });
});

describe("resolveInvocation", () => {
  test("fails on an unknown command, suggesting the closest name", async () => {
    const logs = createLogs(vi.fn());

    await expect(resolve(logs, "help", "frction")).resolves.toMatchObject({
      kind: "failure",
      errors: [
        new CommandUsageError(
          "unknown command 'frction'\n(Did you mean friction?)",
        ),
      ],
    });

    await expect(resolve(logs, "missing", "ta")).resolves.toMatchObject({
      kind: "failure",
      errors: [new CommandUsageError("unknown command 'ta'")],
    });
  });

  test("fails on an unknown option, suggesting the closest flag", async () => {
    await expect(
      resolve(createLogs(vi.fn()), "friction", "add", "--tried", "x", "--trie"),
    ).resolves.toMatchObject({
      kind: "failure",
      errors: [
        new CommandUsageError(
          "unknown option '--trie'\n(Did you mean --tried?)",
        ),
      ],
    });
  });

  test("reserves the help command", () => {
    expect(() => {
      return program({
        root: command({
          name: "program",
          subcommands: [command({ name: "help", action: vi.fn() })],
        }),
      });
    }).toThrow(TypeError);
  });
});
