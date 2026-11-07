import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { buildSection } from "#project/build/index";
import { loadConfig as loadProjectConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";
import { agentsSection } from "#tools/agents/index";
import { gitSection } from "#tools/git/index";
import { prettierSection } from "#tools/prettier/index";
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

    expect((await partial.resolve(buildSection)).sourcemap).toBe(true);
  });

  test("resolves the tool sections lazily next to the project sections", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": `export default { src: { baseline: "2026-10" }, agents: { preferred: ["claude"] } };\n`,
    });

    const config = await loadConfig(project.root);

    expect((await config.resolve(agentsSection)).preferred).toEqual(["claude"]);

    await expect(
      (await config.resolve(gitSection)).gitignore,
    ).resolves.toBeUndefined();

    await expect(
      (await config.resolve(prettierSection)).prettierignore,
    ).resolves.toBeUndefined();
  });
});
