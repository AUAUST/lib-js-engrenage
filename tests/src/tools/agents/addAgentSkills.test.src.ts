import { describe, expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

describe("addAgentSkills", () => {
  test("installs an explicit skill and its agent for every preferred agent", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude", "codex"] } };',
    });

    const config = await loadConfig(project.root);

    await addAgentSkills(
      {
        filesystem: await config.get("filesystem"),
        agents: await config.get("agents"),
      },
      ["debugging"],
    );

    expect((await config.get("filesystem")).changes()).toEqual(
      [
        ".claude/skills/debugging/SKILL.md",
        ".claude/agents/debugger.md",
        ".agents/skills/debugging/SKILL.md",
        ".agents/skills/debugging/agents/openai.yaml",
      ].map((file) => expect.objectContaining({ file })),
    );

    expect(
      await (
        await config.get("filesystem")
      ).read(".claude/skills/debugging/SKILL.md"),
    ).toContain("disable-model-invocation: true");

    expect(
      await (await config.get("filesystem")).read(".claude/agents/debugger.md"),
    ).toMatch(/name: debugger[\s\S]*# Debugging/);

    expect(
      await (
        await config.get("filesystem")
      ).read(".agents/skills/debugging/agents/openai.yaml"),
    ).toContain("allow_implicit_invocation: false");
  });

  test("writes the agent model and effort to the Claude Code agent", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude"] } };',
    });

    const config = await loadConfig(project.root);

    await addAgentSkills(
      {
        filesystem: await config.get("filesystem"),
        agents: await config.get("agents"),
      },
      ["issue-implementation"],
    );

    expect(
      await (await config.get("filesystem")).read(".claude/agents/worker.md"),
    ).toMatch(
      /name: worker[\s\S]*model: sonnet\neffort: medium[\s\S]*# Issue implementation/,
    );
  });

  test("lets the scratchpad skill be invoked implicitly", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude", "codex"] } };',
    });

    const config = await loadConfig(project.root);

    await addAgentSkills(
      {
        filesystem: await config.get("filesystem"),
        agents: await config.get("agents"),
      },
      ["scratchpad"],
    );

    expect(
      await (
        await config.get("filesystem")
      ).read(".claude/skills/scratchpad/SKILL.md"),
    ).not.toContain("disable-model-invocation");

    expect(
      await (
        await config.get("filesystem")
      ).read(".claude/agents/scratcher.md"),
    ).toMatch(/name: scratcher[\s\S]*disallowedTools:[\s\S]*# Scratchpad/);

    expect(
      await (
        await config.get("filesystem")
      ).exists(".agents/skills/scratchpad/agents/openai.yaml"),
    ).toBe(false);
  });

  test("requires preferred agents", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};",
    });

    const config = await loadConfig(project.root);

    const sections = {
      filesystem: await config.get("filesystem"),
      agents: await config.get("agents"),
    };

    await expect(addAgentSkills(sections, ["issue-planning"])).rejects.toThrow(
      "agents.preferred",
    );
  });
});
