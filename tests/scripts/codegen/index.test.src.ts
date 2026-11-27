import { describe, expect, test, vi } from "vitest";

import { runDefinition } from "#tests/utils/runDefinition";

import codegen from "#scripts/codegen/index";

const { runs } = vi.hoisted(() => {
  return {
    runs: [] as { name: string; parameters: unknown[] }[],
  };
});

function createGenerator(name: string) {
  return {
    __esModule: true,
    default(...parameters: unknown[]) {
      runs.push({ name, parameters });
    },
  };
}

vi.mock("#scripts/codegen/actions/editions", () => createGenerator("editions"));

vi.mock("#scripts/codegen/actions/apis", () => createGenerator("apis"));

vi.mock("#scripts/codegen/actions/config", () => createGenerator("config"));

vi.mock("#scripts/codegen/actions/rules", () => createGenerator("rules"));

vi.mock("#scripts/codegen/actions/schemas", () => createGenerator("schemas"));

describe("codegen", () => {
  test("runs every generator in order, forwarding the check", async () => {
    runs.length = 0;

    await runDefinition(codegen.root, "--check");

    expect(runs).toEqual([
      { name: "editions", parameters: [{ check: true }] },
      { name: "apis", parameters: [[], { check: true }] },
      { name: "config", parameters: [{ check: true }] },
      { name: "rules", parameters: [{ check: true }] },
      { name: "schemas", parameters: [{ check: true }] },
    ]);
  });

  test("leaves the check of a named generator to that generator", async () => {
    runs.length = 0;

    await runDefinition(codegen.root, "rules", "--check");

    expect(runs).toEqual([{ name: "rules", parameters: [{ check: true }] }]);
  });
});
