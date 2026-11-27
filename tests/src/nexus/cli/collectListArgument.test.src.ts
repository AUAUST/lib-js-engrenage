import { expect, test, vi } from "vitest";

import {
  argument,
  collectListArgument,
  command,
  createProgram,
} from "#nexus/cli/index";
import { captureCommandOutput } from "#tests/utils/captureCommandOutput";

async function parse(...args: string[]): Promise<unknown> {
  const action = vi.fn();

  const program = createProgram(
    command({
      name: "program",
      subcommands: [
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
      ],
    }),
  );

  captureCommandOutput(program, []);

  await program.parseAsync(["command", ...args], { from: "user" });

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
  await expect(parse(",", " ")).rejects.toMatchObject({
    code: "commander.missingArgument",
  });
});
