import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import {
  resolveAgentReference,
  syncAgentFiles,
} from "@auaust/engrenage/agents";
import { loadConfig } from "@auaust/engrenage/extensions";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { getFixture } from "#tests/utils/getFixture";

const root = getFixture("agents");

const from = join(root, "INSTRUCTIONS.md");

async function resolveSections({
  resolve,
  context,
}: Awaited<ReturnType<typeof loadConfig>>) {
  return { resolve: context.path, agents: await resolve("agents") };
}

describe("syncAgentFiles", () => {
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
        "@auaust/engrenage/metalbrain/sections/precedence.md",
        import.meta.filename,
      ),
    ).toMatch(/\/data\/metalbrain\/sections\/precedence\.md$/);
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

  test("repairs stale planning policy and toggles the owned YAML key while preserving metadata and comments", async () => {
    const planning = "@auaust/engrenage/metalbrain/skills/planning.md";
    const debugging = "@auaust/engrenage/metalbrain/skills/debugging.md";

    const metadata = "# Keep metadata\ninterface:\n  display_name: My skill\npolicy:\n  # Keep policy comment\n  allow_implicit_invocation: false # Keep inline comment\ndependencies:\n  tools: []\n";

    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["codex"] } };',
      ".agents/skills/planning/SKILL.md": `<!-- @reference ${planning} -->\n<!-- @end -->\n`,
      ".agents/skills/planning/agents/openai.yaml": metadata,
      ".agents/skills/debugging/SKILL.md": `<!-- @reference ${debugging} -->\n<!-- @end -->\n`,
      ".agents/skills/debugging/agents/openai.yaml": metadata.replace(
        "false",
        "true",
      ),
      ".agents/skills/notes/SKILL.md": "User owned skill",
      ".agents/skills/notes/agents/openai.yaml": "keep: untouched\n",
    });

    const config = await loadConfig(project.root);

    const { filesystem } = config.context;

    await syncAgentFiles(config);

    expect(
      await filesystem.read(".agents/skills/planning/agents/openai.yaml"),
    ).toBe(metadata.replace("false", "true"));

    expect(
      await filesystem.read(".agents/skills/debugging/agents/openai.yaml"),
    ).toBe(metadata);

    expect(
      await filesystem.read(".agents/skills/notes/agents/openai.yaml"),
    ).toBe("keep: untouched\n");

    await filesystem.write(
      ".agents/skills/planning/agents/openai.yaml",
      metadata,
    );

    await filesystem.write(
      ".agents/skills/debugging/agents/openai.yaml",
      metadata.replace("false", "true"),
    );

    await syncAgentFiles(config);

    expect(
      await filesystem.read(".agents/skills/planning/agents/openai.yaml"),
    ).toBe(metadata.replace("false", "true"));

    expect(
      await filesystem.read(".agents/skills/debugging/agents/openai.yaml"),
    ).toBe(metadata);
  });

  describe("frontmatter", () => {
    const staleAnalysis = [
      "---",
      "name: analysis",
      "description: Stale description.",
      "---",
      "",
      "<!-- @reference @auaust/engrenage/metalbrain/skills/analysis.md -->",
      "",
      "<!-- @end -->",
      "",
    ].join("\n");

    async function load(files: Record<string, string>, planning = true) {
      const project = createTemporaryProject({
        "package.json": '{"type":"module","repository":"github:acme/consumer"}',
        "engrenage.config.ts": `export default { agents: { preferred: ["claude"], instructionFiles: [] }, github: { planning: ${planning} } };`,
        ...files,
      });

      return loadConfig(project.root);
    }

    test("updates a generated description and reports it as outdated", async () => {
      const config = await load(
        { ".claude/skills/analysis/SKILL.md": staleAnalysis },
        false,
      );

      await syncAgentFiles(config);

      expect(config.context.filesystem.changes()).toEqual([
        expect.objectContaining({
          file: ".claude/skills/analysis/SKILL.md",
        }),
      ]);

      expect(
        await config.context.filesystem.read(
          ".claude/skills/analysis/SKILL.md",
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
          "<!-- @reference @auaust/engrenage/metalbrain/skills/issue-implementation.md -->",
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

describe("fragment fillers", () => {
  test("moves a former skill directory and rewrites references to its former fragment", async () => {
    const former = "@auaust/engrenage/agents/skills/issue-planning.md";
    const current = "@auaust/engrenage/metalbrain/skills/planning.md";

    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
      ".claude/skills/issue-planning/SKILL.md": `<!-- @reference ${former} -->\n<!-- @end -->\n`,
      ".claude/agents/planner.md": `<!-- @reference ${former} -->\n<!-- @end -->\n`,
    });

    const config = await loadConfig(project.root);

    const { filesystem } = config.context;

    await syncAgentFiles(config);

    expect(
      await filesystem.exists(".claude/skills/issue-planning/SKILL.md"),
    ).toBe(false);

    expect(await filesystem.read(".claude/skills/planning/SKILL.md")).toContain(
      `<!-- @reference ${current} -->`,
    );

    expect(await filesystem.read(".claude/agents/planner.md")).toContain(
      `<!-- @reference ${current} -->`,
    );
  });

  test("merges former rule files into the one rule that replaces them", async () => {
    const rules = "@auaust/engrenage/agents/rules";

    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
      ".claude/rules/agent-friction.md": `<!-- @reference ${rules}/agent-friction.md -->\n<!-- @end -->\n`,
      ".claude/rules/debt-markers.md": `<!-- @reference ${rules}/debt-markers.md -->\n<!-- @end -->\n`,
    });

    const config = await loadConfig(project.root);

    const { filesystem } = config.context;

    await syncAgentFiles(config);

    expect(await filesystem.exists(".claude/rules/agent-friction.md")).toBe(
      false,
    );

    expect(await filesystem.exists(".claude/rules/debt-markers.md")).toBe(
      false,
    );

    const merged = await filesystem.read(".claude/rules/agent-records.md");

    expect(merged).toBe(
      "<!-- @reference @auaust/engrenage/metalbrain/rules/agent-records.md -->\n<!-- @end -->\n",
    );
  });

  test("keeps a deleted extension default rule out", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] }, github: { planning: true } };',
    });

    const config = await loadConfig(project.root);

    await syncAgentFiles(config);

    expect(
      await config.context.filesystem.exists(".claude/rules/github.md"),
    ).toBe(false);
  });

  test("removes the rules of an extension turned off, keeping project lines", async () => {
    const rules = "@auaust/engrenage/metalbrain/rules";

    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] }, github: { planning: false } };',
      ".claude/rules/github.md": `<!-- @reference ${rules}/github.md -->\n<!-- @end -->\n`,
      ".claude/rules/issue-drafts.md": `<!-- @reference ${rules}/issue-drafts.md -->\n<!-- @end -->\n\nProject line\n`,
    });

    const config = await loadConfig(project.root);

    const { filesystem } = config.context;

    await syncAgentFiles(config);

    expect(await filesystem.exists(".claude/rules/github.md")).toBe(false);

    expect(await filesystem.read(".claude/rules/issue-drafts.md")).toBe(
      "Project line\n",
    );
  });

  test("removes the block of an extension turned off between project lines, leaving one blank line", async () => {
    const rules = "@auaust/engrenage/metalbrain/rules";

    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] }, github: { planning: false } };',
      ".claude/rules/issue-drafts.md": `Intro\n\n<!-- @reference ${rules}/issue-drafts.md -->\n<!-- @end -->\n\nProject line\n`,
    });

    const config = await loadConfig(project.root);

    await syncAgentFiles(config);

    expect(
      await config.context.filesystem.read(".claude/rules/issue-drafts.md"),
    ).toBe("Intro\n\nProject line\n");
  });

  test("removes the generated files of a former skill directory when the new one exists", async () => {
    const former = "@auaust/engrenage/metalbrain/skills/issue-planning.md";
    const current = "@auaust/engrenage/metalbrain/skills/planning.md";

    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
      ".claude/skills/issue-planning/SKILL.md": `<!-- @reference ${former} -->\n<!-- @end -->\n`,
      ".claude/skills/issue-planning/notes.md": "keep\n",
      ".claude/skills/planning/SKILL.md": `<!-- @reference ${current} -->\n<!-- @end -->\n`,
    });

    const config = await loadConfig(project.root);

    const { filesystem } = config.context;

    await syncAgentFiles(config);

    expect(
      await filesystem.read(".claude/skills/issue-planning/notes.md"),
    ).toBe("keep\n");

    expect(
      await filesystem.exists(".claude/skills/issue-planning/SKILL.md"),
    ).toBe(false);
  });

  test.each([true, false])(
    "carries skills synced before the planning data root moved, with github.planning %s",
    async (planning) => {
      const former = "@auaust/engrenage/extensions/tools/github/issues/planning/agents/skills/planning.md";
      const current = "@auaust/engrenage/metalbrain/skills/planning.md";

      const project = createTemporaryProject({
        "package.json": '{"type":"module"}',
        "engrenage.config.ts": `export default { agents: { preferred: ["claude"] }, github: { planning: ${planning} } };`,
        ".claude/skills/planning/SKILL.md": `<!-- @reference ${former} -->\n<!-- @end -->\n`,
        ".claude/agents/planner.md": `<!-- @reference ${former} -->\n<!-- @end -->\n`,
        ".claude/skills/walking/SKILL.md": `<!-- @reference ${current.replace("planning.md", "walking.md")} -->\n<!-- @end -->\n`,
      });

      const config = await loadConfig(project.root);

      const { filesystem } = config.context;

      await syncAgentFiles(config);

      if (!planning) {
        return void expect(
          await filesystem.glob([".claude/skills/*/*", ".claude/agents/*"]),
        ).toEqual([]);
      }

      for (const [file, name] of [
        [".claude/skills/planning/SKILL.md", "planning"],
        [".claude/agents/planner.md", "planner"],
      ] as const) {
        const content = await filesystem.read(file);

        expect(content).toContain(`<!-- @reference ${current} -->`);

        expect(content).toMatch(
          new RegExp(String.raw`^---\nname: ${name}\n`, "u"),
        );
      }
    },
  );

  test("relocates references to the former instruction locations", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
      "AGENTS.md": "# Agents\n\n<!-- @reference @auaust/engrenage/agents/sections/writing.md -->\n<!-- @end -->\n\n<!-- @reference ./local.md -->\n<!-- @end -->\n",
      ".claude/rules/git.md": "<!-- @reference @auaust/engrenage/agents/rules/git.md -->\n<!-- @end -->\n",
      ".ai/backlog/index.md": "# Backlog\n\n<!-- @reference @auaust/engrenage/agents/templates/backlog.md -->\n<!-- @end -->\n\n## Open categories\n",
    });

    const config = await loadConfig(project.root);

    const { filesystem } = config.context;

    await syncAgentFiles(config);

    expect(await filesystem.read("AGENTS.md")).toBe(
      "# Agents\n\n<!-- @reference @auaust/engrenage/metalbrain/sections/writing.md -->\n<!-- @end -->\n\n<!-- @reference ./local.md -->\n<!-- @end -->\n",
    );

    expect(await filesystem.read(".claude/rules/git.md")).toBe(
      "<!-- @reference @auaust/engrenage/metalbrain/rules/git.md -->\n<!-- @end -->\n",
    );

    expect(await filesystem.read(".ai/backlog/index.md")).toContain(
      "<!-- @reference @auaust/engrenage/metalbrain/templates/backlog.md -->",
    );
  });

  test("warns about a snippet overriding a former reference, leaving current ones silent", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"], snippetsDir: "snippets" } };',
      "snippets/@auaust/engrenage/agents/rules/git.md": "Former\n",
      "snippets/@auaust/engrenage/metalbrain/rules/budgets.md": "Current\n",
    });

    const reporter = createTestReporter();

    await syncAgentFiles(await loadConfig(project.root, { reporter }));

    expect(reporter.warnings).toEqual([
      'snippets/@auaust/engrenage/agents/rules/git.md overrides the former reference "@auaust/engrenage/agents/rules/git.md", which no marker names anymore: move it to snippets/@auaust/engrenage/metalbrain/rules/git.md',
    ]);
  });

  test("merges the skills a skill replaces into it, with its agent", async () => {
    const skills = "@auaust/engrenage/agents/skills";

    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
      ".claude/skills/debt-harvesting/SKILL.md": `<!-- @reference ${skills}/debt-harvesting.md -->\n<!-- @end -->\n`,
      ".claude/skills/scratchpad/SKILL.md": `<!-- @reference ${skills}/scratchpad.md -->\n<!-- @end -->\n`,
      ".claude/agents/banker.md": `---\nname: banker\nmodel: haiku\n---\n\n<!-- @reference ${skills}/debt-harvesting.md -->\n<!-- @end -->\n`,
      ".claude/agents/scratcher.md": `---\nname: scratcher\n---\n\n<!-- @reference ${skills}/scratchpad.md -->\n<!-- @end -->\n`,
    });

    const config = await loadConfig(project.root);

    const { filesystem } = config.context;

    await syncAgentFiles(config);

    expect(
      await filesystem.glob([".claude/skills/*/*", ".claude/agents/*"]),
    ).toEqual([
      ".claude/agents/curator.md",
      ".claude/skills/curation/SKILL.md",
    ]);

    expect(await filesystem.read(".claude/agents/curator.md")).toMatch(
      /name: curator[\s\S]*model: opus[\s\S]*@reference @auaust\/engrenage\/metalbrain\/skills\/curation\.md/,
    );
  });

  test("removes the generated files of a skill no longer shipped, leaving the project's own skills", async () => {
    const retired = "@auaust/engrenage/metalbrain/skills/retired.md";

    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude", "codex"] } };',
      ".claude/skills/retired/SKILL.md": `<!-- @reference ${retired} -->\n<!-- @end -->\n`,
      ".agents/skills/retired/SKILL.md": `<!-- @reference ${retired} -->\n<!-- @end -->\n`,
      ".agents/skills/retired/agents/openai.yaml": "policy: {}\n",
      ".claude/agents/retiree.md": `<!-- @reference ${retired} -->\n<!-- @end -->\n`,
      ".codex/agents/retiree.toml": `# Generated by engrenage from ${retired}\nname = "retiree"\n`,
      ".claude/skills/scratchpad/SKILL.md": "User owned skill\n",
      ".claude/agents/mine.md": "User owned agent\n",
      ".codex/agents/mine.toml": 'name = "mine"\n',
    });

    const config = await loadConfig(project.root);

    const { filesystem } = config.context;

    await syncAgentFiles(config);

    await filesystem.flush();

    expect(existsSync(project.resolve(".agents/skills"))).toBe(false);

    expect(
      await filesystem.glob([
        ".claude/skills/**/*.*",
        ".claude/agents/*",
        ".codex/agents/*",
      ]),
    ).toEqual([
      ".claude/agents/mine.md",
      ".claude/skills/scratchpad/SKILL.md",
      ".codex/agents/mine.toml",
    ]);
  });
});
