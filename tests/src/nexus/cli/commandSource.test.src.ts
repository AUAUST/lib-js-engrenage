import { describe, expect, test, vi } from "vitest";

import {
  command,
  commandSource,
  program as declareProgram,
  type CommandDeclaration,
  type CommandLoader,
} from "#nexus/cli/index";
import { runProgram } from "#nexus/cli/operations/runProgram";
import { useFailingProgram } from "#tests/utils/useFailingProgram";

const { getReporter, printed } = useFailingProgram();

function createCommand(name: string, action = vi.fn()) {
  return command({
    name,
    action: () => {
      return Promise.resolve(action);
    },
  });
}

function createLoader(...commands: CommandDeclaration[]) {
  return vi.fn<CommandLoader>(() => {
    return Promise.resolve(commands);
  });
}

function run(
  subcommands: readonly (CommandDeclaration | CommandLoader)[],
  ...args: string[]
) {
  return runProgram(
    declareProgram({
      root: command({ name: "program", subcommands }),
      scenarios: getReporter().scenarios,
    }),
    ["node", "program", ...args],
  );
}

describe("command loaders", () => {
  test("calls no later loader once an earlier one provides the name", async () => {
    const action = vi.fn();
    const later = createLoader(createCommand("y"));

    await run([createLoader(createCommand("x", action)), later], "x");

    expect(action).toHaveBeenCalledOnce();
    expect(later).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  test.each([
    ["help", "x"],
    ["x", "--help"],
  ])(
    "calls loaders only up to the one a help target comes from (%s %s)",
    async (...args) => {
      const later = createLoader(createCommand("y"));

      await run([createLoader(createCommand("x")), later], ...args);

      expect(later).not.toHaveBeenCalled();
      expect(process.exitCode).toBeUndefined();
    },
  );

  test("fails --help on a name two loaders provide, while a run matches the first", async () => {
    const action = vi.fn();

    const loaders = [
      createLoader(createCommand("x", action)),
      createLoader(createCommand("x")),
    ];

    await run(loaders, "--help");

    expect(printed()).toContain(
      "The 'x' command in 'program' comes from both the loader at position 1 and the loader at position 2",
    );

    expect(process.exitCode).toBe(1);

    process.exitCode = undefined;

    await run(loaders, "x");

    expect(action).toHaveBeenCalledOnce();
    expect(process.exitCode).toBeUndefined();
  });

  test("lists a name a shadowable source provides once, from the earlier subcommand", async () => {
    const shadowable = vi.fn<CommandLoader>(() => {
      return Promise.resolve(
        commandSource({
          commands: [createCommand("x"), createCommand("z")],
          shadowable: true,
        }),
      );
    });

    await run([createCommand("x"), shadowable], "--help");

    expect(process.exitCode).toBeUndefined();
    expect(printed()).toContain("commands  x, z, help");
  });

  test("reports a loader failing as a command error", async () => {
    await run(
      [
        () => {
          return Promise.reject(new Error("unreadable"));
        },
      ],
      "x",
    );

    expect(printed()).toContain(
      "The loader at position 1 of 'program' failed to load\nCaused by: unreadable",
    );

    expect(process.exitCode).toBe(1);
  });
});
