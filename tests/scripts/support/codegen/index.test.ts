import { describe, expect, test, vi } from "vitest";

import { codegen } from "#scripts/support/codegen/index";
import { runCommand } from "#tests/helpers/runCommand";
import type { CommandDefinition } from "#support/commander/types/CommandDefinition";

const { runs } = vi.hoisted(() => {
  return {
    runs: [] as { name: string; check: boolean }[],
  };
});

function createGenerator(name: string): CommandDefinition {
  return (command) => {
    return command.option("--check", "", false).action(({ check }) => {
      runs.push({
        name,
        check,
      });
    });
  };
}

vi.mock("#scripts/support/codegen/apis", () => {
  return { apis: createGenerator("apis") };
});

vi.mock("#scripts/support/codegen/rules", () => {
  return { rules: createGenerator("rules") };
});

vi.mock("#scripts/support/codegen/barrels", () => {
  return { barrels: createGenerator("barrels") };
});

describe("support codegen", () => {
  test("runs every generator, rules before barrels, forwarding the check", async () => {
    runs.length = 0;

    await runCommand(codegen, "--check");

    expect(runs).toEqual([
      { name: "apis", check: true },
      { name: "rules", check: true },
      { name: "barrels", check: true },
    ]);
  });

  test("leaves the check of a named generator to that generator", async () => {
    runs.length = 0;

    await runCommand(codegen, "barrels", "--check");

    expect(runs).toEqual([{ name: "barrels", check: true }]);
  });
});
