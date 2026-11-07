import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { buildSection } from "#project/build/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";
import { agentsSection } from "#tools/agents/index";
import { gitSection } from "#tools/git/index";
import { prettierSection } from "#tools/prettier/index";
import { validateConfig } from "#workflows/registry/operations/validateConfig";

describe("validateConfig", () => {
  test("rejects unknown keys, naming the file and each key path", async () => {
    const root = getFixture("config/invalid");

    const config = await loadConfig(root);

    expect(() => validateConfig(config)).toThrow(
      join(root, "engrenage.config.ts"),
    );

    expect(() => validateConfig(config)).toThrow('Unknown key "sources"');
    expect(() => validateConfig(config)).toThrow("at sources");
    expect(() => validateConfig(config)).toThrow("at src.generatd");
  });

  test("validates every section eagerly while a partial resolution ignores the others", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": `export default { src: { baseline: "2026-10" }, agents: { unknown: true } };\n`,
    });

    const partial = await loadConfig(project.root);

    expect(() => validateConfig(partial)).toThrow('Unknown key "unknown"');

    expect((await partial.resolve(buildSection)).sourcemap).toBe(true);
  });

  test("resolves the tool sections lazily next to the project sections", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": `export default { src: { baseline: "2026-10" }, agents: { preferred: ["claude"] } };\n`,
    });

    const config = validateConfig(await loadConfig(project.root));

    expect((await config.resolve(agentsSection)).preferred).toEqual(["claude"]);

    await expect(
      (await config.resolve(gitSection)).gitignore,
    ).resolves.toBeUndefined();

    await expect(
      (await config.resolve(prettierSection)).prettierignore,
    ).resolves.toBeUndefined();
  });
});
