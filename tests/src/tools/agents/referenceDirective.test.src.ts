import { describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { fillBlocks } from "#tests/utils/fillBlocks";
import { getFixture } from "#tests/utils/getFixture";

function createProject(instructions: string, fragment = "") {
  return createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"], instructionFiles: ["AGENTS.md"] } };',
    "src/feature/index.ts": "",
    "fragment.md": fragment,
    "AGENTS.md": instructions,
  });
}

describe("reference directive", () => {
  test("syncs only the configured instruction files", async () => {
    const config = await loadConfig(getFixture("agents"));

    await runSync(config, { names: ["blocks"] });

    expect(config.context.filesystem.discard()).toEqual([
      {
        file: "INSTRUCTIONS.md",
        status: "synced",
      },
    ]);
  });

  test("warns about an unresolvable reference and leaves its block untouched", async () => {
    const warn = vi.spyOn(console, "warn");

    const instructions = [
      "<!-- @reference ./missing.md -->",
      "kept text",
      "<!-- @end -->",
      "",
    ].join("\n");

    const project = createProject(instructions);

    const config = await loadConfig(project.root);

    expect(await fillBlocks(config, "AGENTS.md")).toBe(instructions);

    expect(warn).toHaveBeenCalledWith(
      `Cannot resolve reference "./missing.md" in ${project.resolve("AGENTS.md")}: its block is left untouched`,
    );
  });

  test("renders a filler directive inside the referenced fragment", async () => {
    const project = createProject(
      "<!-- @reference ./fragment.md -->\n<!-- @end -->\n",
      "# Shared\n\n<!-- @environment-map src -->\n<!-- @end -->\n\nAfter.\n",
    );

    const content = await fillBlocks(
      await loadConfig(project.root),
      "AGENTS.md",
    );

    expect(content).toContain("# Shared\n\n# Project map: src\n");
    expect(content).toContain("feature");
    expect(content).toContain("\n\nAfter.\n");
    expect(content).not.toContain("@environment-map");
  });

  test("fails on an unknown directive, naming it", async () => {
    const project = createProject(
      "<!-- @reference ./fragment.md -->\n<!-- @end -->\n",
      "<!-- @unknown-table -->\n<!-- @end -->\n",
    );

    await expect(
      fillBlocks(await loadConfig(project.root), "AGENTS.md"),
    ).rejects.toThrow('Unknown directive in "<!-- @unknown-table -->"');
  });

  test("fails on a misspelled directive, naming the file and line", async () => {
    const project = createProject(
      "# Title\n\n<!-- @referenc x -->\n<!-- @end -->\n",
    );

    await expect(
      fillBlocks(await loadConfig(project.root), "AGENTS.md"),
    ).rejects.toThrow(
      'AGENTS.md: line 3: Unknown directive in "<!-- @referenc x -->"',
    );
  });
});
