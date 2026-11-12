import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";

describe("addAgentSkills", () => {
  test("installs an explicit skill and its agent for every preferred agent", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude", "codex"] } };',
    });

    const config = await loadConfig(project.root);

    await addAgentSkills(
      {
        filesystem: config.context.filesystem,
        agents: await config.resolve("agents"),
        fillers: {},
      },
      ["debugging"],
    );

    expect(config.context.filesystem.changes()).toEqual(
      [
        ".claude/skills/debugging/SKILL.md",
        ".claude/agents/debugger.md",
        ".agents/skills/debugging/SKILL.md",
        ".agents/skills/debugging/agents/openai.yaml",
        ".codex/agents/debugger.toml",
        ".codex/agents/debugger_low.toml",
        ".codex/agents/debugger_high.toml",
      ].map((file) => expect.objectContaining({ file })),
    );

    expect(
      await config.context.filesystem.read(".claude/skills/debugging/SKILL.md"),
    ).toContain("disable-model-invocation: true");

    expect(
      await config.context.filesystem.read(".claude/agents/debugger.md"),
    ).toMatch(/name: debugger[\s\S]*# Debugging/);

    expect(
      await config.context.filesystem.read(
        ".agents/skills/debugging/agents/openai.yaml",
      ),
    ).toContain("allow_implicit_invocation: false");
  });

  test("writes the agent model and effort to the Claude Code agent", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
    });

    const config = await loadConfig(project.root);

    await addAgentSkills(
      {
        filesystem: config.context.filesystem,
        agents: await config.resolve("agents"),
        fillers: {},
      },
      ["issue-implementation"],
    );

    expect(
      await config.context.filesystem.read(".claude/agents/worker.md"),
    ).toMatch(
      /name: worker[\s\S]*model: opus\neffort: low[\s\S]*# Issue implementation/,
    );
  });

  test("lets the scratchpad skill be invoked implicitly", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude", "codex"] } };',
    });

    const config = await loadConfig(project.root);

    await addAgentSkills(
      {
        filesystem: config.context.filesystem,
        agents: await config.resolve("agents"),
        fillers: {},
      },
      ["scratchpad"],
    );

    expect(
      await config.context.filesystem.read(
        ".claude/skills/scratchpad/SKILL.md",
      ),
    ).not.toContain("disable-model-invocation");

    expect(
      await config.context.filesystem.read(".claude/agents/scratcher.md"),
    ).toMatch(/name: scratcher[\s\S]*disallowedTools:[\s\S]*# Scratchpad/);

    expect(
      await config.context.filesystem.exists(
        ".agents/skills/scratchpad/agents/openai.yaml",
      ),
    ).toBe(true);
  });

  test("installs six canonical roles selectively with their complexity effort variants", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["codex"] } };',
    });

    const config = await loadConfig(project.root);

    const sections = {
      filesystem: config.context.filesystem,
      agents: await config.resolve("agents"),
      fillers: {},
    };

    await addAgentSkills(sections, ["issue-implementation"]);

    expect(await sections.filesystem.glob(".codex/agents/*.toml")).toEqual([
      ".codex/agents/worker.toml",
      ".codex/agents/worker_medium.toml",
    ]);

    await addAgentSkills(sections, [
      "debugging",
      "planning",
      "backlog-handling",
      "debt-harvesting",
      "scratchpad",
    ]);

    expect(await sections.filesystem.glob(".codex/agents/*.toml")).toEqual([
      ".codex/agents/backlogger.toml",
      ".codex/agents/banker.toml",
      ".codex/agents/debugger.toml",
      ".codex/agents/debugger_high.toml",
      ".codex/agents/debugger_low.toml",
      ".codex/agents/planner.toml",
      ".codex/agents/scratcher.toml",
      ".codex/agents/worker.toml",
      ".codex/agents/worker_medium.toml",
    ]);

    await sections.filesystem.flush();

    await addAgentSkills(sections, [
      "issue-implementation",
      "debugging",
      "planning",
      "backlog-handling",
      "debt-harvesting",
      "scratchpad",
    ]);

    expect(sections.filesystem.changes()).toEqual([]);
  });

  test("preserves and reports an unowned profile collision", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": 'export default { agents: { preferred: ["codex"] } };',
      ".codex/agents/worker.toml": 'name = "custom"\n',
    });

    const config = await loadConfig(project.root);

    const sections = {
      filesystem: config.context.filesystem,
      agents: await config.resolve("agents"),
      fillers: {},
    };

    await expect(
      addAgentSkills(sections, ["issue-implementation"]),
    ).rejects.toThrow("Unowned Codex agent profile .codex/agents/worker.toml");

    expect(await sections.filesystem.read(".codex/agents/worker.toml")).toBe(
      'name = "custom"\n',
    );
  });

  test("requires preferred agents", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};",
    });

    const config = await loadConfig(project.root);

    const sections = {
      filesystem: config.context.filesystem,
      agents: await config.resolve("agents"),
      fillers: {},
    };

    await expect(addAgentSkills(sections, ["planning"])).rejects.toThrow(
      "agents.preferred",
    );
  });
});
