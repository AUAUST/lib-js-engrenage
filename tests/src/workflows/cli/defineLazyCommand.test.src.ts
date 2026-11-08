import { describe, expect, expectTypeOf, test, vi } from "vitest";
import type { Command } from "@commander-js/extra-typings";

import {
  createProgram,
  defineGroup,
  defineLazyCommand,
  type DefaultActionParameters,
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
        action: () => Promise.resolve(action),
      }),
    );

    expect(action).toHaveBeenCalledOnce();
  });

  test("rejects a loader resolving to an object without default", async () => {
    const command = defineLazyCommand({
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
    defineLazyCommand({
      configure(command) {
        return command.argument("<count>");
      },
      // @ts-expect-error the action takes a number, Commander passes a string
      action() {
        return Promise.resolve({ default: (count: number) => count });
      },
    });
  });

  test("runs the action of a command declaring nothing without parameters", async () => {
    const action = vi.fn((name?: string) => name);

    await run(
      defineLazyCommand({
        action: () => Promise.resolve({ default: action }),
      }),
    );

    expect(action.mock.calls).toEqual([[]]);
  });

  test("types the action of a command declaring nothing without parameters", () => {
    expectTypeOf<DefaultActionParameters<Command>>().toEqualTypeOf<[]>();

    expectTypeOf<
      DefaultActionParameters<Command<[], { loud: boolean }>>
    >().toEqualTypeOf<[{ loud: boolean }, Command<[], { loud: boolean }>]>();

    defineLazyCommand({
      // @ts-expect-error a command declaring nothing passes no options
      action() {
        return Promise.resolve({
          default: (options: { loud: boolean }) => options,
        });
      },
    });
  });
});
