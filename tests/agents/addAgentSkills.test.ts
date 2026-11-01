import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";

import { addAgentSkills } from "#agents/setup/addAgentSkills";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

describe("addAgentSkills", () => {
  test("installs an explicit skill and its agent for every preferred agent", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude", "codex"] } };',
    });

    const config = await loadConfig(project.root);

    addAgentSkills(config, ["issue-planning"]);

    expect(config.filesystem.changes()).toEqual(
      [
        ".claude/skills/issue-planning/SKILL.md",
        ".claude/agents/planner.md",
        ".agents/skills/issue-planning/SKILL.md",
        ".agents/skills/issue-planning/agents/openai.yaml",
      ].map((file) => expect.objectContaining({ file })),
    );

    expect(
      config.filesystem.read(".claude/skills/issue-planning/SKILL.md"),
    ).toContain("disable-model-invocation: true");

    expect(config.filesystem.read(".claude/agents/planner.md")).toMatch(
      /name: planner[\s\S]*# Issue planning/,
    );

    expect(
      config.filesystem.read(
        ".agents/skills/issue-planning/agents/openai.yaml",
      ),
    ).toContain("allow_implicit_invocation: false");
  });

  test("writes the agent model to the Claude Code agent", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude"] } };',
    });

    const config = await loadConfig(project.root);

    addAgentSkills(config, ["issue-implementation"]);

    expect(config.filesystem.read(".claude/agents/worker.md")).toMatch(
      /name: worker[\s\S]*model: sonnet[\s\S]*# Issue implementation/,
    );
  });

  test("requires preferred agents", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};",
    });

    const config = await loadConfig(project.root);

    expect(() => addAgentSkills(config, ["issue-planning"])).toThrow(
      "agents.preferred",
    );
  });
});
