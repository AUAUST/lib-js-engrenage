import { describe, expect, test, vi } from "vitest";

import { createProgram, defineGroup } from "@auaust/engrenage/future/nexus/cli";

describe("definitions from another module instance", () => {
  test("a group defined through a second import runs its commands", async () => {
    vi.resetModules();

    const second = await import("@auaust/engrenage/future/nexus/cli");

    expect(second.defineGroup).not.toBe(defineGroup);

    const action = vi.fn();

    const program = createProgram(
      "program",
      defineGroup({
        commands: {
          group: second.defineGroup({
            commands: {
              leaf: second.defineCommand({ action }),
            },
          }),
        },
      }),
    );

    await program.parseAsync(["group", "leaf", "--debug"], { from: "user" });

    expect(action).toHaveBeenCalledOnce();
  });
});
