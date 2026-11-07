import { join } from "node:path";

import { describe, expect, test, vi } from "vitest";

import { agentsSection } from "@auaust/engrenage";
import {
  resolveAgentReference,
  syncAgentFiles,
} from "@auaust/engrenage/agents";
import { loadConfig } from "@auaust/engrenage/config";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";

const root = getFixture("agents");

const from = join(root, "INSTRUCTIONS.md");

async function resolveSections({
  resolve,
  context,
}: Awaited<ReturnType<typeof loadConfig>>) {
  return { resolve: context.path, agents: await resolve(agentsSection) };
}

describe("syncAgentFiles", () => {
  test("syncs only the configured instruction files", async () => {
    const config = await loadConfig(root);

    await syncAgentFiles(config);

    expect(config.context.filesystem.discard()).toEqual([
      {
        file: "INSTRUCTIONS.md",
        status: "synced",
      },
    ]);
  });

  test("resolves snippets, references relative to the file and package specifiers", async () => {
    const config = await loadConfig(root);
    const references = await resolveSections(config);

    expect(await resolveAgentReference(references, "shared.md", from)).toBe(
      join(root, ".agents/snippets/shared.md"),
    );

    expect(await resolveAgentReference(references, "./AGENTS.md", from)).toBe(
      join(root, "AGENTS.md"),
    );

    expect(
      await resolveAgentReference(
        references,
        "@auaust/engrenage/agents/sections/precedence.md",
        import.meta.filename,
      ),
    ).toMatch(/\/data\/agents\/sections\/precedence\.md$/);
  });

  test("resolves package fragments exported only under the import condition", async () => {
    const references = await resolveSections(await loadConfig(root));

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
      await resolveAgentReference(
        references,
        "fragments/shared.md",
        project.resolve("AGENTS.md"),
      ),
    ).toBe(project.resolve("node_modules/fragments/shared.md"));
  });

  test("names the reference and the file when nothing matches", async () => {
    const references = await resolveSections(await loadConfig(root));

    await expect(
      resolveAgentReference(references, "missing.md", from),
    ).rejects.toThrow(`Cannot resolve reference "missing.md" in ${from}`);
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

    await syncAgentFiles(config);

    expect(await config.context.filesystem.read("AGENTS.md")).toBe(
      instructions,
    );

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

      await syncAgentFiles(config);

      expect(config.context.filesystem.changes()).toEqual([
        expect.objectContaining({
          file: ".claude/skills/scratchpad/SKILL.md",
        }),
      ]);

      expect(
        await config.context.filesystem.read(
          ".claude/skills/scratchpad/SKILL.md",
        ),
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

      await syncAgentFiles(config);

      const content = await config.context.filesystem.read(
        ".claude/agents/worker.md",
      );

      expect(content).toContain("description: Mine.");
      expect(content).toContain("model: opus");
      expect(content).toContain("extra: kept");
      expect(content).toContain("# @preserve description");
    });
  });
});
