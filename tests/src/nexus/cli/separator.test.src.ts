import { expect, test, vi } from "vitest";

import { argument, command, CommandUsageError, option } from "#nexus/cli/index";
import { runCommand } from "#tests/utils/runCommand";

async function parse(...args: string[]): Promise<unknown> {
  const action = vi.fn();

  await runCommand(
    "command",
    command({
      name: "command",
      arguments: [
        argument({
          name: "refs",
          variadic: true,
          separator: ",",
        }),
      ],
      action: () => Promise.resolve(action),
    }),
    ...args,
  );

  return action.mock.calls[0]?.[0];
}

test("flattens separated and variadic values into one list", async () => {
  await expect(parse("1,2", "3")).resolves.toEqual(["1", "2", "3"]);
});

test("drops empty items around stray separators and spaces", async () => {
  await expect(parse("1,", " 2 ,,3", ",")).resolves.toEqual(["1", "2", "3"]);
});

test("rejects a list left empty as a missing argument", async () => {
  await expect(parse(",", " ")).rejects.toThrow(
    new CommandUsageError("missing required argument 'refs'"),
  );
});

test("checks and maps each item of a repeated separated option", async () => {
  const action = vi.fn();

  const run = (...args: string[]) => {
    return runCommand(
      "command",
      command({
        name: "command",
        options: [
          option({
            name: "level",
            type: "string",
            multiple: true,
            separator: ",",
            choices: ["1", "2", "3"],
            parse: Number,
          }),
        ],
        action: () => Promise.resolve(action),
      }),
      ...args,
    );
  };

  await run("--level", "1,2", "--level", "3");

  expect(action).toHaveBeenCalledWith({ level: [1, 2, 3] });

  await expect(run("--level", "1,4")).rejects.toThrow(
    new CommandUsageError(
      "option '--level <value>' argument '4' is invalid. Allowed choices are 1, 2, 3.",
    ),
  );
});
