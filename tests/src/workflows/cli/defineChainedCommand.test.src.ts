import { describe, expect, test, vi } from "vitest";

import {
  createProgram,
  defineChainedCommand,
  defineGroup,
} from "#workflows/cli/index";

function run(
  action: (invocations: readonly [string, string][]) => void,
  ...args: string[]
) {
  return createProgram(
    "program",
    defineGroup({
      commands: {
        command: defineChainedCommand({
          configure(command) {
            return command
              .argument("<words...>")
              .requiredOption("--note <text>");
          },
          action() {
            return Promise.resolve(action);
          },
          parse(words, { note }) {
            return [words.join(" "), note];
          },
        }),
      },
    }),
  ).parseAsync(["command", ...args], { from: "user" });
}

describe("defineChainedCommand", () => {
  test("passes every invocation, keeping --next after --", async () => {
    const action = vi.fn();

    await run(
      action,
      "a",
      "--note",
      "x",
      "--next",
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

  test("runs no invocation when one fails to parse, naming its position", async () => {
    const action = vi.fn();

    await expect(
      run(
        action,
        "a",
        "--note",
        "x",
        "--next",
        "b",
        "--next",
        "c",
        "--note",
        "z",
      ),
    ).rejects.toThrow(
      "1 of 3 invocations failed, so none took effect:\ninvocation 2: required option '--note <text>' not specified",
    );

    expect(action).not.toHaveBeenCalled();
  });
});
