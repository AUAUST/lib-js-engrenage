import { describe, expect, test, vi } from "vitest";

import {
  command,
  commandMount,
  commandSource,
  program as declareProgram,
  directorySource,
  type CommandDeclaration,
  type CommandLoader,
} from "#nexus/cli/index";
import { runProgram } from "#nexus/cli/operations/runProgram";
import { getFixture } from "#tests/utils/getFixture";
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

  test("yields a shadowed command's aliases with its name", async () => {
    const shadowed = vi.fn();

    const shadowable = vi.fn<CommandLoader>(() => {
      return Promise.resolve(
        commandSource({
          commands: [
            command({
              name: "x",
              aliases: ["w"],
              action: () => {
                return Promise.resolve(shadowed);
              },
            }),
          ],
          shadowable: true,
        }),
      );
    });

    await run(
      [createCommand("x"), shadowable, createLoader(createCommand("w"))],
      "w",
    );

    expect(shadowed).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();

    await run(
      [createCommand("x"), shadowable, createLoader(createCommand("w"))],
      "--help",
    );

    expect(printed()).not.toContain("comes from both");
    expect(process.exitCode).toBeUndefined();
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

const scripts = directorySource({
  directories: [getFixture("nexus/scripts"), getFixture("nexus/missing")],
  entry: "index.ts",
  executable: "executable.ts",
});

describe("directory sources", () => {
  test("runs the program a subdirectory's entry default-exports, named after it", async () => {
    await run([scripts], "greet");

    expect(printed()).toBe("greeted");
    expect(process.exitCode).toBeUndefined();
  });

  test("runs a subdirectory's executable as its own process with the rest of argv", async () => {
    await run([scripts], "spawned", "3");

    expect(process.exitCode).toBe(3);
  });

  test("resolves a subdirectory's executable unchainable", async () => {
    await run([scripts], "spawned", "0", "--next", "greet");

    expect(printed()).not.toContain("greeted");
    expect(process.exitCode).toBe(1);
  });

  test("reports an entry default-exporting no program as a command error", async () => {
    await run(
      [
        directorySource({
          directories: [getFixture("nexus/invalid")],
          entry: "index.ts",
          executable: "executable.ts",
        }),
      ],
      "broken",
    );

    expect(printed()).toContain(
      "The 'broken' command of 'program' failed to load from",
    );

    expect(printed()).toContain("default-exports no program");
    expect(process.exitCode).toBe(1);
  });

  test("lists only subdirectories holding an entry or an executable", async () => {
    await run([scripts], "--help");

    expect(printed()).toContain("commands  greet, spawned, help");
  });

  test("loads a mount only once routing matches it", async () => {
    let loads = 0;

    const mounted = commandMount({
      name: "y",
      origin: "the y module",
      load() {
        loads += 1;

        return Promise.resolve(
          command({
            name: "y",
            action: () => {
              return Promise.resolve(() => {});
            },
          }),
        );
      },
    });

    await runProgram(
      declareProgram({
        root: command({
          name: "program",
          subcommands: [
            command({
              name: "x",
              action: () => {
                return Promise.resolve(() => {});
              },
            }),
            mounted,
          ],
        }),
        scenarios: getReporter().scenarios,
      }),
      ["node", "program", "x"],
    );

    expect(loads).toBe(0);
  });

  test("names a mount by its origin in a conflict", async () => {
    await run(
      [
        () => {
          return Promise.resolve(
            command({
              name: "greet",
              action: () => {
                return Promise.resolve(() => {});
              },
            }),
          );
        },
        scripts,
      ],
      "--help",
    );

    expect(printed()).toContain(
      `The 'greet' command in 'program' comes from both the loader at position 1 and ${getFixture("nexus/scripts/greet/index.ts")}`,
    );
  });
});
