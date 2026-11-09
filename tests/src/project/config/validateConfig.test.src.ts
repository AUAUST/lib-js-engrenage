import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { map } from "@auaust/primitive-kit/arrays";

import { loadConfig } from "#project/config/operations/loadConfig";
import { validateConfig } from "#project/config/operations/validateConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";

describe("validateConfig", () => {
  test("rejects an unknown key of a section, naming the file and the section", async () => {
    const root = getFixture("config/invalid");

    const config = await loadConfig(root);

    await expect(validateConfig(config)).rejects.toThrow(
      join(root, "engrenage.config.ts"),
    );

    await expect(validateConfig(config)).rejects.toThrow("Invalid src config");

    await expect(validateConfig(config)).rejects.toThrow(
      'Unknown key "generatd"',
    );
  });

  test("rejects an unknown top-level key, naming it and listing the registered extensions", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": `export default { sources: ["src"] };\n`,
    });

    const config = await loadConfig(project.root);

    const names = map(config.context.registry.extensions, ({ name }) => name);

    await expect(validateConfig(config)).rejects.toThrow(
      `Unknown key "sources"\nRegistered extensions: ${names.join(", ")}`,
    );
  });

  test("rejects an invalid git input with the git section's message", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": `export default { git: { unknown: true } };\n`,
    });

    const config = await loadConfig(project.root);

    await expect(validateConfig(config)).rejects.toThrow("Invalid git config");

    await expect(validateConfig(config)).rejects.toThrow(
      'Unknown key "unknown"',
    );
  });

  test("rejects a renamed key, naming its replacement", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": `export default { tests: { layout: "mirror" } };\n`,
    });

    const config = await loadConfig(project.root);

    await expect(validateConfig(config)).rejects.toThrow(
      "Invalid tests config",
    );

    await expect(validateConfig(config)).rejects.toThrow(
      'Unknown key "layout", renamed "mirror"',
    );
  });

  test("validates every section eagerly while a partial resolution ignores the others", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": `export default { src: { baseline: "2026-10" }, agents: { unknown: true } };\n`,
    });

    const partial = await loadConfig(project.root);

    await expect(validateConfig(partial)).rejects.toThrow(
      'Unknown key "unknown"',
    );

    expect((await partial.resolve("build")).sourcemap).toBe(true);
  });

  test("reports every failing section at once", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": `export default { src: { generatd: true }, agents: { unknown: true }, sources: [] };\n`,
    });

    const config = await loadConfig(project.root);

    await expect(validateConfig(config)).rejects.toThrow("Invalid src config");

    await expect(validateConfig(config)).rejects.toThrow(
      "Invalid agents config",
    );

    await expect(validateConfig(config)).rejects.toThrow(
      'Unknown key "sources"',
    );
  });

  test("resolves the tool sections lazily next to the project sections", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        devDependencies: { prettier: "*" },
      }),
      "engrenage.config.ts": `export default { src: { baseline: "2026-10" }, agents: { preferred: ["claude"] } };\n`,
    });

    const config = await validateConfig(await loadConfig(project.root));

    expect((await config.resolve("agents")).preferred).toEqual(["claude"]);

    await expect(
      (await config.resolve("git")).gitignore,
    ).resolves.toBeUndefined();

    await expect(
      (await config.resolve("prettier")).prettierignore,
    ).resolves.toBeUndefined();
  });
});
