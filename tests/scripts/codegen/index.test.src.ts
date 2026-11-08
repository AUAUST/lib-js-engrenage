import { describe, expect, test, vi } from "vitest";

import { runDefinition } from "#tests/utils/runDefinition";

import codegen from "#scripts/codegen/index";

const { runs } = vi.hoisted(() => {
  return {
    runs: [] as { name: string; check: boolean }[],
  };
});

async function createGenerator(name: string) {
  const { defineCommand } = await import("#workflows/cli/index");

  return {
    default: defineCommand({
      configure(command) {
        return command.option("--check", "", false);
      },
      action({ check }) {
        runs.push({
          name,
          check,
        });
      },
    }),
  };
}

vi.mock("#scripts/codegen/editions", () => createGenerator("editions"));

vi.mock("#scripts/codegen/apis", () => createGenerator("apis"));

vi.mock("#scripts/codegen/config", () => createGenerator("config"));

vi.mock("#scripts/codegen/rules", () => createGenerator("rules"));

vi.mock("#scripts/codegen/barrels", () => createGenerator("barrels"));

describe("support codegen", () => {
  test("runs every generator, rules before barrels, forwarding the check", async () => {
    runs.length = 0;

    await runDefinition(codegen, "--check");

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

    await runDefinition(codegen, "barrels", "--check");

    expect(runs).toEqual([{ name: "barrels", check: true }]);
  });
});
