import { describe, expect, test } from "vitest";

import { syncAgentFiles, syncCodexFiles } from "@auaust/engrenage/agents";
import { loadConfig } from "@auaust/engrenage/config";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

const override =
  "# Codex only\n\n<!-- @rules -->\n<!-- @end -->\n\nKeep this project note.\n";

describe("syncCodexFiles", () => {
  test("maps local globs and global rules, preserves notes and stays idempotent", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts":
        'export default { agents: { preferred: ["codex"], instructionFiles: ["*.md", ".claude/rules/**/*.md"] } };',
      "AGENTS.override.md": override,
      ".claude/rules/types.md":
        '---\npaths: ["src/**/*.ts", "tests/**/*.ts"]\n---\nType rules',
      ".claude/rules/general.md": "General rules",
      ".codex/hooks.json":
        '{"hooks":{"Stop":[{"hooks":[{"type":"command","command":"custom-check"}]}]}}',
    });

    const config = await loadConfig(project.root);
    syncAgentFiles(config);
    syncCodexFiles(config);
    config.filesystem.flush();
    const result = project.read("AGENTS.override.md");

    expect(result).toContain(
      "<code>src/**/*.ts</code> | <code>.claude/rules/types.md</code>",
    );

    expect(result).toContain("<code>tests/**/*.ts</code>");

    expect(result).toContain(
      "All files | <code>.claude/rules/general.md</code>",
    );

    expect(result).toContain("Keep this project note.");
    expect(project.read(".codex/hooks.json")).toContain("custom-check");

    expect(project.read(".codex/hooks.json")).toContain(
      "engrenage agents codex hook edit",
    );

    syncCodexFiles(config);
    expect(config.filesystem.changes()).toEqual([]);

    config.filesystem.write(
      ".claude/rules/types.md",
      '---\npaths: ["lib/**"]\n---\nTypes',
    );

    syncCodexFiles(config);
    expect(config.filesystem.read("AGENTS.override.md")).toContain("lib/**");

    expect(config.filesystem.read("AGENTS.override.md")).not.toContain(
      "src/**/*.ts",
    );
  });

  test("does nothing without selected agents, even with an explicit creation flag", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};",
      "AGENTS.override.md": override,
    });

    const config = await loadConfig(project.root);

    syncCodexFiles(config, {
      hooks: true,
    });

    expect(config.filesystem.changes()).toEqual([]);
  });

  test("rejects invalid frontmatter with the rule path", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts":
        'export default { agents: { preferred: ["codex"] } };',
      "AGENTS.override.md": override,
      ".claude/rules/broken.md": "---\npaths: false\n---\nRule",
    });

    const config = await loadConfig(project.root);

    expect(() => syncCodexFiles(config)).toThrow(
      ".claude/rules/broken.md frontmatter",
    );
  });
});
