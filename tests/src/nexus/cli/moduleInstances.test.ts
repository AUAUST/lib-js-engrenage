import { describe, expect, test, vi } from "vitest";

import { command, createProgram } from "@auaust/engrenage/future/nexus/cli";

describe("declarations from another module instance", () => {
  test("a group declared through a second import runs its commands", async () => {
    vi.resetModules();

    const second = await import("@auaust/engrenage/future/nexus/cli");

    expect(second.command).not.toBe(command);

    const action = vi.fn();

    const program = createProgram(
      command({
        name: "program",
        subcommands: [
          second.command({
            name: "group",
            subcommands: [
              second.command({
                name: "leaf",
                action: () => Promise.resolve(action),
              }),
            ],
          }),
        ],
      }),
    );

    await program.parseAsync(["group", "leaf", "--debug"], { from: "user" });

    expect(action).toHaveBeenCalledOnce();
  });
});
