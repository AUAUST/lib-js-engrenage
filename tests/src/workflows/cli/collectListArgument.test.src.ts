import { expect, test, vi } from "vitest";

import {
  collectListArgument,
  createProgram,
  defineCommand,
  defineGroup,
} from "#workflows/cli/index";

async function parse(...args: string[]): Promise<unknown> {
  const action = vi.fn();

  await createProgram(
    "program",
    defineGroup({
      commands: {
        command: defineCommand({
          configure(command) {
            return command.argument("<refs...>", "", collectListArgument);
          },
          action,
        }),
      },
    }),
  ).parseAsync(["command", ...args], { from: "user" });

  return action.mock.calls[0]?.[0];
}

test("collects comma-separated and space-separated items alike", async () => {
  await expect(parse("1,2,3")).resolves.toEqual(["1", "2", "3"]);

  await expect(parse("1", "2", "3")).resolves.toEqual(["1", "2", "3"]);
});

test("drops empty items around stray commas and spaces", async () => {
  await expect(parse("1,", " 2 ,,3", ",")).resolves.toEqual(["1", "2", "3"]);
});
