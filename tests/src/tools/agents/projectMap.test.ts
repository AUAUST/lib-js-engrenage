import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import { syncAgents } from "@auaust/engrenage/agents";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const mapFile = ".claude/rules/project-map.md";

function createProject() {
  return createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "engrenage.config.ts": `export default {
  preset: "library",
  agents: { preferred: ["claude"] },
  roles: { define: { handlers: { exports: "named-match" } } },
  src: {
    namespaces: { ".": { layers: ["base", "*"] } },
    domains: { "feature": { purpose: "The feature." } },
  },
};\n`,
    "src/base/core/index.ts": "",
    "src/feature/index.ts": "",
    "src/feature/entry.ts": "",
    "src/feature/handlers/run.ts": "",
  });
}

describe("project map", () => {
  test("renders namespaces, layers, domains and project-defined roles", async () => {
    const project = createProject();
    const config = await loadConfig(project.root);

    syncAgents(config);
    config.filesystem.flush();

    const map = project.read(mapFile);

    expect(map).toContain("Layers of `.`: `base` < `*`");
    expect(map).toContain("#### `src/feature`");
    expect(map).toContain("- Visibility: public");
    expect(map).toContain("- Purpose: The feature.");
    expect(map).toContain("| `handlers` |");
    expect(map).toContain("domains of a lower layer");
  });

  test("reports a stale map as synced and a fresh one as unchanged", async () => {
    const config = await loadConfig(createProject().root);

    syncAgents(config);
    config.filesystem.flush();
    config.filesystem.write(mapFile, "stale\n");
    config.filesystem.flush();
    syncAgents(config);

    expect(config.filesystem.flush()).toContainEqual({
      file: mapFile,
      status: "synced",
    });

    syncAgents(config);

    expect(config.filesystem.discard()).toEqual([]);
  });
});
