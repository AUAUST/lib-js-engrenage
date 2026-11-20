import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { reportStructure } from "#project/structure/operations/reportStructure";
import { runStructureCheck } from "#project/structure/operations/runStructureCheck";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

async function loadProject() {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "src/index.ts": "",
    "src/feature/index.ts": "",
    "engrenage.config.ts": 'export default { src: { strictness: "loose" } };\n',
  });

  return loadConfig(project.root);
}

describe("reportStructure", () => {
  test("passes the check with a missing purpose under its warnings", async () => {
    const result = await runStructureCheck(await loadProject());

    expect(result).toEqual({
      ok: true,
      output: "",
      warnings: "src/feature has no purpose: set one on its `domains` entry.",
    });
  });

  test("keeps its facts, environments and node paths included, through JSON", async () => {
    const { facts } = await reportStructure(await loadProject());

    expect(facts.structure.src?.root.children.map(({ path }) => path)).toEqual([
      "src/feature",
    ]);

    const serialized = JSON.stringify(facts);

    expect(JSON.parse(serialized)).toEqual(facts);
  });
});
