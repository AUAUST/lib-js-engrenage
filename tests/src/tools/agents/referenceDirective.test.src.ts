import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { fillBlocks } from "#tests/utils/fillBlocks";
import { getFixture } from "#tests/utils/getFixture";
import { addAgentSkills } from "#tools/agents/index";

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
    const reporter = createTestReporter();

    const instructions = [
      "<!-- @reference ./missing.md -->",
      "kept text",
      "<!-- @end -->",
      "",
    ].join("\n");

    const project = createProject(instructions);

    const config = await loadConfig(project.root, { reporter });

    expect(await fillBlocks(config, "AGENTS.md")).toBe(instructions);

    expect(reporter.warnings).toContain(
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

  test.each([false, true])(
    "gates the debugging walk text on planning: %s",
    async (planning) => {
      const project = createTemporaryProject({
        "package.json": '{"type":"module","repository":"github:acme/consumer"}',
        "engrenage.config.ts": `export default { agents: { preferred: ["claude"], instructionFiles: [] }, github: { planning: ${String(planning)} } };`,
      });

      const config = await loadConfig(project.root);

      await addAgentSkills(config, ["debugging"]);

      const skill = await config.context.filesystem.read(
        ".claude/skills/debugging/SKILL.md",
      );

      expect(skill?.includes("Walk:")).toBe(planning);
      expect(skill?.includes("**The current repository.**")).toBe(planning);
    },
  );
});
