import { expect, test, vi } from "vitest";

import {
  argument,
  collectListArgument,
  command,
  CommandUsageError,
} from "#nexus/cli/index";
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
          reduce: collectListArgument,
        }),
      ],
      action: () => Promise.resolve(action),
    }),
    ...args,
  );

  return action.mock.calls[0]?.[0];
}

test("collects comma-separated and space-separated items alike", async () => {
  await expect(parse("1,2,3")).resolves.toEqual(["1", "2", "3"]);

  await expect(parse("1", "2", "3")).resolves.toEqual(["1", "2", "3"]);
});

test("drops empty items around stray commas and spaces", async () => {
  await expect(parse("1,", " 2 ,,3", ",")).resolves.toEqual(["1", "2", "3"]);
});

test("rejects a list left empty as a missing argument", async () => {
  await expect(parse(",", " ")).rejects.toThrow(
    new CommandUsageError("missing required argument 'refs'"),
  );
});
