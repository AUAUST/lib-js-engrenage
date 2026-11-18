import { describe, expect, expectTypeOf, test, vi } from "vitest";
import type { Command } from "@commander-js/extra-typings";

import { createTestReporter } from "#tests/utils/createTestReporter";
import {
  createProgram,
  defineGroup,
  defineLazyCommand,
  type DefaultActionParameters,
} from "#workflows/cli/index";
import { runContext } from "#workflows/cli/operations/runContext";

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

    const load = vi.fn(() => Promise.resolve(action));

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

    await program.parseAsync(["command", "3", "--loud"], {
      from: "user",
    });

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

  test("never starts an action whose run was aborted while it loaded", async () => {
    const controller = new AbortController();
    const action = vi.fn();

    const command = defineLazyCommand({
      action() {
        controller.abort(new Error("aborted"));

        return Promise.resolve(action);
      },
    });

    await expect(
      runContext.run(
        {
          signal: controller.signal,
          reporter: createTestReporter(),
        },
        () => run(command),
      ),
    ).rejects.toThrow("aborted");

    expect(action).not.toHaveBeenCalled();
  });

  test("rejects a loader resolving to a plain object", async () => {
    const command = defineLazyCommand({
      action() {
        return Promise.resolve({ default: vi.fn() });
      },
    });

    await expect(run(command)).rejects.toThrow(
      new TypeError(
        "The action of the command command loads neither a function nor a module whose default or only export is one",
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
        action: () => Promise.resolve(action),
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
