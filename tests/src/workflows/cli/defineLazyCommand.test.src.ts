import { describe, expect, test, vi } from "vitest";

import {
  createProgram,
  defineGroup,
  defineLazyCommand,
} from "#workflows/cli/index";

function run(command: Parameters<typeof createProgram>[1], ...args: string[]) {
  return createProgram(
    "program",
    defineGroup({
      commands: { command },
    }),
  ).parseAsync(["command", ...args], { from: "user" });
}

describe("defineLazyCommand", () => {
  test("loads its action only when it runs, with the values parse returns", async () => {
    const action = vi.fn((count: number, { loud }: { loud: boolean }) => {
      return [count, loud];
    });

    const load = vi.fn(() => Promise.resolve({ default: action }));

    const command = defineLazyCommand({
      configure(command) {
        return command.argument("<count>").option("--loud", "", false);
      },
      action: load,
      parse(count, options) {
        return [Number(count), options];
      },
    });

    const program = createProgram(
      "program",
      defineGroup({
        commands: { command },
      }),
    );

    expect(load).not.toHaveBeenCalled();

    await program.parseAsync(["command", "3", "--loud"], { from: "user" });

    expect(load).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledWith(3, { loud: true });
  });

  test("runs a loader resolving to a function", async () => {
    const action = vi.fn();

    await run(
      defineLazyCommand({
        configure: (command) => command,
        action: () => Promise.resolve(action),
      }),
    );

    expect(action).toHaveBeenCalledOnce();
  });

  test("rejects a loader resolving to an object without default", async () => {
    const command = defineLazyCommand({
      configure: (command) => command,
      // @ts-expect-error a module without a default export is no action
      action() {
        return Promise.resolve({ named: vi.fn() });
      },
    });

    await expect(run(command)).rejects.toThrow(
      new TypeError(
        "The action of the command command loads neither a function nor a module whose default export is one",
      ),
    );
  });

  test("requires parse when Commander's parameters do not fit the action", () => {
    // @ts-expect-error the action takes a number, Commander passes a string
    defineLazyCommand({
      configure(command) {
        return command.argument("<count>");
      },
      action() {
        return Promise.resolve({ default: (count: number) => count });
      },
    });
  });
});
