import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";

async function loadConsumer() {
  const project = createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
  });

  return loadConfig(project.root);
}

describe("addAgentSkills", () => {
  test("installs an explicit skill and its agent", async () => {
    const config = await loadConsumer();

    await addAgentSkills(config, ["debugging"]);

    expect(config.context.filesystem.changes()).toEqual(
      [
        ".claude/skills/debugging/SKILL.md",
        ".claude/skills/debugging/analysis.md",
        ".claude/skills/debugging/request-analysis.md",
        ".claude/agents/debugger.md",
      ].map((file) => expect.objectContaining({ file })),
    );

    expect(
      await config.context.filesystem.read(".claude/skills/debugging/SKILL.md"),
    ).toContain("disable-model-invocation: true");

    expect(
      await config.context.filesystem.read(".claude/agents/debugger.md"),
    ).toMatch(/name: debugger[\s\S]*# Debugging/);
  });

  test("writes the agent model and effort to the Claude Code agent", async () => {
    const config = await loadConsumer();

    await addAgentSkills(config, ["implement"]);

    expect(
      await config.context.filesystem.read(".claude/agents/worker.md"),
    ).toMatch(
      /name: worker[\s\S]*model: opus\neffort: medium[\s\S]*# Implementation/,
    );
  });

  test("lets the curation skill be invoked implicitly", async () => {
    const config = await loadConsumer();

    await addAgentSkills(config, ["curation"]);

    expect(
      await config.context.filesystem.read(".claude/skills/curation/SKILL.md"),
    ).not.toContain("disable-model-invocation");

    expect(
      await config.context.filesystem.exists(".claude/agents/curator.md"),
    ).toBe(false);
  });

  test("installs agents selectively, once", async () => {
    const config = await loadConsumer();

    await addAgentSkills(config, ["implement"]);

    expect(await config.context.filesystem.glob(".claude/agents/*.md")).toEqual(
      [".claude/agents/worker.md"],
    );

    await addAgentSkills(config, ["debugging", "planning", "curation"]);

    expect(await config.context.filesystem.glob(".claude/agents/*.md")).toEqual(
      [
        ".claude/agents/debugger.md",
        ".claude/agents/planner.md",
        ".claude/agents/worker.md",
      ],
    );

    await config.context.filesystem.flush();

    await addAgentSkills(config, [
      "implement",
      "debugging",
      "planning",
      "curation",
    ]);

    expect(config.context.filesystem.changes()).toEqual([]);
  });

  test("requires preferred agents", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module","repository":"github:acme/consumer"}',
      "engrenage.config.ts": "export default {};",
    });

    const config = await loadConfig(project.root);

    await expect(addAgentSkills(config, ["planning"])).rejects.toThrow(
      "agents.preferred",
    );
  });
});
