import { rmSync } from "node:fs";

import { describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
import { checkAgents } from "#tools/agents/operations/checkAgents";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";

vi.mock("#foundation/processes/operations/spawnProcess", () => {
  return {
    spawnProcess: vi.fn(() => {
      return Promise.resolve({
        status: 0,
        stdout: "2.1.318 (Claude Code)\n",
        stderr: "",
        error: undefined,
        signal: null,
      });
    }),
  };
});

const reference = "@fixtures/skills/metalbrain/skills/guide/notes.md";

const synced = [
  ".claude/skills/guide/notes.md",
  ".agents/skills/guide/notes.md",
];

function createProject({
  metadata = "",
  body = "Read `notes.md` beside this skill.",
  supporting = "notes.md",
}: { metadata?: string; body?: string; supporting?: string } = {}) {
  return createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": [
      "export default {",
      '  agents: { preferred: ["claude", "codex"] },',
      '  extensions: [{ name: "fixture-skills", root: new URL("./skills/", import.meta.url) }],',
      "};",
    ].join("\n"),
    "AGENTS.md": "Instructions\n",
    "skills/package.json": JSON.stringify({
      name: "@fixtures/skills",
      exports: { "./metalbrain/skills/*.md": "./metalbrain/skills/*.md" },
    }),
    "skills/metalbrain/skills/guide.md": [
      "---",
      "title: Guide",
      "description: A skill with a supporting file.",
      "category: fixture",
      "order: 1",
      metadata,
      "---",
      "",
      "# Guide",
      "",
      body,
      "",
    ].join("\n"),
    [`skills/metalbrain/skills/guide/${supporting}`]: "# Notes\n\nRead on demand.\n",
  });
}

async function install(project: ReturnType<typeof createProject>) {
  const config = await loadConfig(project.root);

  await addAgentSkills(
    {
      filesystem: config.context.filesystem,
      agents: await config.resolve("agents"),
      extensions: await listActiveExtensions(config),
      fillers: await createAgentFillers(config),
      config,
    },
    ["guide"],
  );

  await config.context.filesystem.flush();

  return config.context.filesystem;
}

async function sync(project: ReturnType<typeof createProject>) {
  const config = await loadConfig(project.root);

  await syncAgentFiles(config);

  await config.context.filesystem.flush();

  return config;
}

describe("skill supporting files", () => {
  test("syncs beside each runtime's SKILL.md, filled through its reference marker, and checks current", async () => {
    const project = createProject();

    const filesystem = await install(project);

    for (const file of synced) {
      await filesystem.remove(file);
    }

    await filesystem.flush();

    const config = await sync(project);

    for (const file of synced) {
      expect(project.read(file)).toBe(
        `<!-- @reference ${reference} -->\n\n# Notes\n\nRead on demand.\n\n<!-- @end -->\n`,
      );
    }

    const findings = await checkAgents(config);

    expect(
      findings
        .filter(({ message }) => message.includes("skills/guide/"))
        .map(({ status, message }) => `${status} ${message.split(":")[0]}`),
    ).toEqual([
      "configured .claude/skills/guide/SKILL.md",
      "configured .claude/skills/guide/notes.md",
      "configured .agents/skills/guide/SKILL.md",
      "configured .agents/skills/guide/notes.md",
    ]);
  });

  test("removes the synced copies once their source is gone, keeping the skill", async () => {
    const project = createProject();

    const filesystem = await install(project);

    rmSync(project.resolve("skills/metalbrain/skills/guide/notes.md"));

    await filesystem.write(".claude/skills/guide/other.md", "Project notes\n");

    await sync(project);

    expect(
      await filesystem.glob([".claude/skills/**/*.*", ".agents/skills/**/*.*"]),
    ).toEqual([
      ".agents/skills/guide/SKILL.md",
      ".agents/skills/guide/agents/openai.yaml",
      ".claude/skills/guide/SKILL.md",
      ".claude/skills/guide/other.md",
    ]);
  });

  test("lets an agent skill reach its supporting file through a path rendered per runtime", async () => {
    const project = createAgentProject("mode.md");

    const filesystem = await install(project);

    expect(await filesystem.exists(".claude/skills/guide/mode.md")).toBe(true);

    expect(await filesystem.exists(".agents/skills/guide/mode.md")).toBe(true);

    const config = await sync(project);

    for (const file of [
      ".claude/agents/guider.md",
      ".claude/skills/guide/SKILL.md",
    ]) {
      expect(project.read(file)).toContain("`.claude/skills/guide/mode.md`");
    }

    for (const file of [
      ".agents/skills/guide/SKILL.md",
      ".codex/agents/guider.toml",
    ]) {
      expect(project.read(file)).toContain("`.agents/skills/guide/mode.md`");
    }

    const findings = await checkAgents(config);

    expect(
      findings
        .filter(({ message }) => /guide\/|guider/.test(message))
        .map(({ status, message }) => `${status} ${message.split(":")[0]}`),
    ).toEqual([
      "configured .claude/skills/guide/SKILL.md",
      "configured .claude/skills/guide/mode.md",
      "configured .claude/agents/guider.md",
      "configured .agents/skills/guide/SKILL.md",
      "configured .agents/skills/guide/mode.md",
      "configured .codex/agents/guider.toml",
    ]);
  });

  test("fails on a skill file naming no supporting file, listing the skill's", async () => {
    const project = createAgentProject("missing.md");

    await expect(sync(project)).rejects.toThrow(
      'Expected one supporting file of skill "guide": mode.md',
    );
  });
});

function createAgentProject(file: string) {
  return createProject({
    metadata: "agent:\n  name: guider\n  description: Guider",
    body: `Read this file first:\n\n<!-- @skill-file ${file} -->\n<!-- @end -->`,
    supporting: "mode.md",
  });
}
