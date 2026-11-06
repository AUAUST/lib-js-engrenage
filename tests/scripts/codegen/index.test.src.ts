import { describe, expect, test, vi } from "vitest";

import { codegen } from "#scripts/codegen/index";
import { runCommand } from "#tests/utils/runCommand";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

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

vi.mock("#scripts/codegen/editions", () => {
  return { editions: createGenerator("editions") };
});

vi.mock("#scripts/codegen/apis", () => {
  return { apis: createGenerator("apis") };
});

vi.mock("#scripts/codegen/config", () => {
  return { config: createGenerator("config") };
});

vi.mock("#scripts/codegen/rules", () => {
  return { rules: createGenerator("rules") };
});

vi.mock("#scripts/codegen/barrels", () => {
  return { barrels: createGenerator("barrels") };
});

describe("support codegen", () => {
  test("runs every generator, rules before barrels, forwarding the check", async () => {
    runs.length = 0;

    await runCommand(codegen, "--check");

    expect(runs).toEqual([
      { name: "editions", check: true },
      { name: "apis", check: true },
      { name: "config", check: true },
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
