import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { loadConfig as loadProjectConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

describe("loadConfig of the registry", () => {
  test("rejects unknown keys, naming the file and each key path", async () => {
    const root = getFixture("config/invalid");

    const error = loadConfig(root);

    await expect(error).rejects.toThrow(join(root, "engrenage.config.ts"));
    await expect(error).rejects.toThrow('Unknown key "sources"');
    await expect(error).rejects.toThrow("at sources");
    await expect(error).rejects.toThrow("at src.generatd");
  });

  test("validates every section eagerly while a partial resolution ignores the others", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": `export default { src: { baseline: "2026-10" }, agents: { unknown: true } };\n`,
    });

    await expect(loadConfig(project.root)).rejects.toThrow(
      'Unknown key "unknown"',
    );

    const partial = await loadProjectConfig(project.root);

    expect(partial.build.sourcemap).toBe(true);
  });

  test("resolves the tool sections lazily next to the project sections", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": `export default { src: { baseline: "2026-10" }, agents: { preferred: ["claude"] } };\n`,
    });

    const config = await loadConfig(project.root);

    expect(config.agents.preferred).toEqual(["claude"]);
    expect(config.git.gitignore).toBeUndefined();
    expect(config.prettier.prettierignore).toBeUndefined();
  });
});
