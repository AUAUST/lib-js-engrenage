import { describe, expect, test, vi } from "vitest";

import {
  createProgram,
  defineCommand,
  defineGroup,
  defineLazyCommand,
} from "#workflows/cli/index";

describe("defineGroup", () => {
  test("loads the action of its lazy command only when the group itself runs", async () => {
    const action = vi.fn();

    const load = vi.fn(() => Promise.resolve({ default: action }));

    const leaf = vi.fn();

    const program = createProgram(
      "program",
      defineGroup({
        commands: {
          leaf: defineCommand({
            configure(command) {
              return command;
            },
            action: leaf,
          }),
        },
        command: defineLazyCommand({
          configure(command) {
            return command;
          },
          action: load,
          parse() {
            return [];
          },
        }),
      }),
    );

    await program.parseAsync(["leaf"], { from: "user" });

    expect(leaf).toHaveBeenCalledOnce();
    expect(load).not.toHaveBeenCalled();

    await program.parseAsync([], { from: "user" });

    expect(load).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledWith();
  });
});
