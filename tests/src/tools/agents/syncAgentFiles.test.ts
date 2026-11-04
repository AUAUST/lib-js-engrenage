import { join } from "node:path";

import { describe, expect, test, vi } from "vitest";

import {
  resolveAgentReference,
  syncAgentFiles,
} from "@auaust/engrenage/agents";
import { loadConfig } from "@auaust/engrenage/config";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";

const root = getFixture("agents");

const from = join(root, "INSTRUCTIONS.md");

describe("syncAgentFiles", () => {
  test("syncs only the configured instruction files", async () => {
    const config = await loadConfig(root);

    syncAgentFiles(config);

    expect(config.filesystem.discard()).toEqual([
      {
        file: "INSTRUCTIONS.md",
        status: "synced",
      },
    ]);
  });

  test("resolves snippets, references relative to the file and package specifiers", async () => {
    const config = await loadConfig(root);

    expect(resolveAgentReference(config, "shared.md", from)).toBe(
      join(root, ".agents/snippets/shared.md"),
    );

    expect(resolveAgentReference(config, "./AGENTS.md", from)).toBe(
      join(root, "AGENTS.md"),
    );

    expect(
      resolveAgentReference(
        config,
        "@auaust/engrenage/agents/sections/precedence.md",
        import.meta.filename,
      ),
    ).toMatch(/\/data\/agents\/sections\/precedence\.md$/);
  });

  test("resolves package fragments exported only under the import condition", async () => {
    const config = await loadConfig(root);

    const project = createTemporaryProject({
      "AGENTS.md": "",
      "node_modules/fragments/package.json": JSON.stringify({
        name: "fragments",
        type: "module",
        exports: {
          "./*.md": { import: "./*.md" },
        },
      }),
      "node_modules/fragments/shared.md": "",
    });

    expect(
      resolveAgentReference(
        config,
        "fragments/shared.md",
        project.resolve("AGENTS.md"),
      ),
    ).toBe(project.resolve("node_modules/fragments/shared.md"));
  });

  test("names the reference and the file when nothing matches", async () => {
    const config = await loadConfig(root);

    expect(() => {
      return resolveAgentReference(config, "missing.md", from);
    }).toThrow(`Cannot resolve reference "missing.md" in ${from}`);
  });

  test("warns about an unresolvable reference and leaves its block untouched", async () => {
    const warn = vi.spyOn(console, "warn");

    const instructions = [
      "<!-- @reference ./missing.md -->",
      "kept text",
      "<!-- @end -->",
      "",
    ].join("\n");

    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude"], instructionFiles: ["AGENTS.md"] } };',
      "AGENTS.md": instructions,
    });

    const config = await loadConfig(project.root);

    syncAgentFiles(config);

    expect(config.filesystem.read("AGENTS.md")).toBe(instructions);

    expect(warn).toHaveBeenCalledWith(
      `Cannot resolve reference "./missing.md" in ${project.resolve("AGENTS.md")}: its block is left untouched`,
    );
  });

  describe("frontmatter", () => {
    const staleScratchpad = [
      "---",
      "name: scratchpad",
      "description: Stale description.",
      "---",
      "",
      "<!-- @reference @auaust/engrenage/agents/skills/scratchpad.md -->",
      "",
      "<!-- @end -->",
      "",
    ].join("\n");

    async function load(files: Record<string, string>) {
      const project = createTemporaryProject({
        "package.json": '{"type":"module"}',
        "engrenage.config.ts":
          'export default { agents: { preferred: ["claude"], instructionFiles: [] } };',
        ...files,
      });

      return loadConfig(project.root);
    }

    test("updates a generated description and reports it as outdated", async () => {
      const config = await load({
        ".claude/skills/scratchpad/SKILL.md": staleScratchpad,
      });

      syncAgentFiles(config);

      expect(config.filesystem.changes()).toEqual([
        expect.objectContaining({
          file: ".claude/skills/scratchpad/SKILL.md",
        }),
      ]);

      expect(
        config.filesystem.read(".claude/skills/scratchpad/SKILL.md"),
      ).not.toContain("Stale description");
    });

    test("keeps a preserved key and still updates the others", async () => {
      const config = await load({
        ".claude/agents/worker.md": [
          "---",
          "# @preserve description",
          "name: worker",
          "description: Mine.",
          "model: haiku",
          "extra: kept",
          "---",
          "",
          "<!-- @reference @auaust/engrenage/agents/skills/issue-implementation.md -->",
          "",
          "<!-- @end -->",
          "",
        ].join("\n"),
      });

      syncAgentFiles(config);

      const content = config.filesystem.read(".claude/agents/worker.md");

      expect(content).toContain("description: Mine.");
      expect(content).toContain("model: sonnet");
      expect(content).toContain("extra: kept");
      expect(content).toContain("# @preserve description");
    });
  });
});
