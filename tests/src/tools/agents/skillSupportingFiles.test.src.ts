import { existsSync, rmSync, writeFileSync } from "node:fs";

import { describe, expect, test, vi } from "vitest";

import { addAgentSkills } from "#metalbrain/runtimes/operations/addAgentSkills";
import { checkAgents } from "#metalbrain/runtimes/operations/checkAgents";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { fillReferenceBlock } from "#tools/metalbrain/operations/fillReferenceBlock";
import { loadAgentInputs } from "#tools/metalbrain/operations/loadAgentInputs";
import { loadInstructionFormatter } from "#tools/metalbrain/operations/loadInstructionFormatter";
import { syncAgentFiles } from "#tools/metalbrain/setup/syncAgentFiles";

vi.mock("#foundation/processes/operations/spawnProcess", async () => {
  const {
    resolveClaudeVersion,
  } = await import("#tests/utils/resolveClaudeVersion");

  return { spawnProcess: vi.fn(resolveClaudeVersion) };
});

const reference = "@fixtures/skills/metalbrain/skills/guide/notes.md";

const synced = [".claude/skills/guide/notes.md"];

function createProject({
  agent = "",
  body = "Read `notes.md` beside this skill.",
  supporting = "notes.md",
  agents = "",
  preferred = ["claude"],
  contributes = "",
}: {
  agent?: string;
  body?: string;
  supporting?: string;
  agents?: string | undefined;
  preferred?: readonly string[];
  contributes?: string;
} = {}) {
  return createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": [
      "export default {",
      `  agents: { preferred: ${JSON.stringify(preferred)}, ${agents} },`,
      `  extensions: [{ name: "fixture-skills", root: new URL("./skills/", import.meta.url), contributes: { "agents.instructions": [{ kind: "skill", name: "guide", category: "fixture"${agent} }], ${contributes} } }],`,
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

  await addAgentSkills(await loadAgentInputs(config), ["guide"]);

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

    const findings = await checkAgents({
      ...(await loadAgentInputs(config)),
      format: await loadInstructionFormatter(config),
    });

    expect(
      findings
        .filter(({ message }) => message.includes("skills/guide/"))
        .map(({ status, message }) => `${status} ${message.split(":")[0]}`),
    ).toEqual([
      "configured .claude/skills/guide/SKILL.md",
      "configured .claude/skills/guide/notes.md",
    ]);
  });

  test("removes the synced copies once their source is gone, keeping the skill", async () => {
    const project = createProject();

    const filesystem = await install(project);

    rmSync(project.resolve("skills/metalbrain/skills/guide/notes.md"));

    await filesystem.write(".claude/skills/guide/other.md", "Project notes\n");

    await sync(project);

    expect(await filesystem.glob(".claude/skills/**/*.*")).toEqual([
      ".claude/skills/guide/SKILL.md",
      ".claude/skills/guide/other.md",
    ]);
  });

  test("lets an agent skill reach its supporting file through its rendered path", async () => {
    const project = createAgentProject("mode.md");

    const filesystem = await install(project);

    expect(await filesystem.exists(".claude/skills/guide/mode.md")).toBe(true);

    const config = await sync(project);

    for (const file of [
      ".claude/agents/guider.md",
      ".claude/skills/guide/SKILL.md",
    ]) {
      expect(project.read(file)).toContain("`.claude/skills/guide/mode.md`");
    }

    const findings = await checkAgents({
      ...(await loadAgentInputs(config)),
      format: await loadInstructionFormatter(config),
    });

    expect(
      findings
        .filter(({ message }) => /guide\/|guider/.test(message))
        .map(({ status, message }) => `${status} ${message.split(":")[0]}`),
    ).toEqual([
      "configured .claude/skills/guide/SKILL.md",
      "configured .claude/skills/guide/mode.md",
      "configured .claude/agents/guider.md",
    ]);
  });

  test("renders a skill file in a snippet overriding the skill", async () => {
    const project = createAgentProject("mode.md", 'snippetsDir: "snippets"');

    const filesystem = await install(project);

    await filesystem.write(
      "snippets/@fixtures/skills/metalbrain/skills/guide.md",
      "# Guide\n\nOverridden:\n\n<!-- @skill-file mode.md -->\n<!-- @end -->\n",
    );

    await filesystem.flush();

    const skill = await fillReferenceBlock({
      args: ["@fixtures/skills/metalbrain/skills/guide.md"],
      file: ".claude/skills/guide/SKILL.md",
      config: await loadConfig(project.root),
    });

    expect(skill).toContain("Overridden:");

    expect(skill).toContain("`.claude/skills/guide/mode.md`");
  });

  test("installs skills in a contributed runtime's directories, rendering its skill file paths", async () => {
    const project = createProject({
      preferred: ["fixture"],
      contributes: '"agents.runtimes": [{ name: "fixture", skills: ".fixture/skills", agents: ".fixture/agents" }]',
      agent: ', agent: { name: "guider", description: "Guider" }',
      body: "Read this file first:\n\n<!-- @skill-file mode.md -->\n<!-- @end -->",
      supporting: "mode.md",
    });

    await install(project);

    await sync(project);

    expect(project.read(".fixture/skills/guide/mode.md")).toContain(
      "Read on demand.",
    );

    expect(project.read(".fixture/skills/guide/SKILL.md")).toContain(
      "`.fixture/skills/guide/mode.md`",
    );
  });

  test("fails on a contributed filler named after a built-in one, naming its extension", async () => {
    const project = createProject({
      contributes: '"agents.fillers": [{ name: "skill-file", load: () => Promise.resolve({ default: () => "" }) }]',
    });

    await expect(sync(project)).rejects.toThrow(
      'Agent filler "@skill-file" is built in and cannot be contributed, by fixture-skills',
    );
  });

  test("fails on a skill file naming no supporting file, listing the skill's", async () => {
    const project = createAgentProject("missing.md");

    await expect(sync(project)).rejects.toThrow(
      'Expected one supporting file of skill "guide": mode.md',
    );
  });
});

function createSharedProject() {
  function skill(name: string, body: string) {
    return [
      "---",
      `title: ${name}`,
      "description: A skill sharing a file.",
      "---",
      "",
      body,
      "",
    ].join("\n");
  }

  const shared = "Steps:\n\n<!-- @shared-file steps.md -->\n<!-- @end -->";

  return createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": [
      "export default {",
      '  agents: { preferred: ["claude"] },',
      '  extensions: [{ name: "fixture-skills", root: new URL("./skills/", import.meta.url), contributes: { "agents.instructions": [{ kind: "skill", name: "guide", category: "fixture" }, { kind: "skill", name: "other", category: "fixture" }] } }],',
      "};",
    ].join("\n"),
    "AGENTS.md": "Instructions\n",
    "skills/package.json": JSON.stringify({
      name: "@fixtures/skills",
      exports: {
        "./metalbrain/skills/*.md": "./metalbrain/skills/*.md",
        "./metalbrain/shared/*.md": "./metalbrain/shared/*.md",
      },
    }),
    "skills/metalbrain/skills/guide.md": skill("Guide", shared),
    "skills/metalbrain/skills/other.md": skill(
      "Other",
      `${shared}\n\n<!-- @extension absent -->\n<!-- @shared-file gone.md -->\n<!-- @end -->\n<!-- @end -->`,
    ),
    "skills/metalbrain/shared/steps.md": "# Steps\n\nShared.\n",
    "skills/metalbrain/shared/unused.md": "# Unused\n",
  });
}

describe("shared skill files", () => {
  const sharedReference = "@fixtures/skills/metalbrain/shared/steps.md";

  test("installs a shared file beside each skill referencing it, rendered as its path", async () => {
    const project = createSharedProject();

    const config = await loadConfig(project.root);

    await addAgentSkills(await loadAgentInputs(config), ["guide", "other"]);

    await config.context.filesystem.flush();

    for (const directory of [".claude/skills"]) {
      for (const name of ["guide", "other"]) {
        expect(project.read(`${directory}/${name}/steps.md`)).toBe(
          `<!-- @reference ${sharedReference} -->\n\n# Steps\n\nShared.\n\n<!-- @end -->\n`,
        );

        expect(project.read(`${directory}/${name}/SKILL.md`)).toContain(
          `\`${directory}/${name}/steps.md\``,
        );
      }
    }

    expect(
      await config.context.filesystem.glob(".claude/skills/*/unused.md"),
    ).toEqual([]);
  });

  test("fails on an unknown shared file and removes a copy once its skill no longer references it", async () => {
    const project = createSharedProject();

    const config = await loadConfig(project.root);

    await addAgentSkills(await loadAgentInputs(config), ["guide", "other"]);

    await config.context.filesystem.flush();

    const guide = project.resolve("skills/metalbrain/skills/guide.md");

    writeFileSync(
      guide,
      project
        .read("skills/metalbrain/skills/guide.md")
        .replace("steps.md", "missing.md"),
    );

    await expect(sync(project)).rejects.toThrow(
      /Expected one shared file of skill "guide": .*\bsteps\.md\b/,
    );

    writeFileSync(
      guide,
      "---\ntitle: Guide\ndescription: A skill sharing a file.\n---\n\nNo steps.\n",
    );

    await sync(project);

    expect(existsSync(project.resolve(".claude/skills/guide/steps.md"))).toBe(
      false,
    );

    expect(existsSync(project.resolve(".claude/skills/other/steps.md"))).toBe(
      true,
    );
  });
});

function createAgentProject(file: string, agents?: string) {
  return createProject({
    agents,
    agent: ', agent: { name: "guider", description: "Guider" }',
    body: `Read this file first:\n\n<!-- @skill-file ${file} -->\n<!-- @end -->`,
    supporting: "mode.md",
  });
}
