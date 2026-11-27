import { describe, expect, test, vi } from "vitest";

import {
  command,
  program,
  runProgram,
} from "@auaust/engrenage/future/nexus/cli";

describe("declarations from another module instance", () => {
  test("a group declared through a second import runs its commands", async () => {
    vi.resetModules();

    const second = await import("@auaust/engrenage/future/nexus/cli");

    expect(second.command).not.toBe(command);

    const action = vi.fn();

    vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    const declared = program({
      root: command({
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
    });

    await runProgram(declared, ["node", "program", "group", "leaf", "--debug"]);

    expect(action).toHaveBeenCalledOnce();
  });
});
