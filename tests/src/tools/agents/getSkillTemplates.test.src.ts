import { describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

vi.mock(import("#tools/agents/operations/getInstructionTemplates"), () => {
  return {
    getInstructionTemplates: () => {
      return [
        {
          title: "Broken",
          description: "Broken skill",
          category: "workflow",
          default: false,
          order: 0,
          name: "broken",
          source: "/skills/broken.md",
          reference: "@auaust/engrenage/agents/skills/broken.md",
          body: "# Broken",
          paths: undefined,
          agent: {
            name: "breaker",
            description: "Breaker",
            effort: "extreme",
          },
        },
      ];
    },
  };
});

describe("getSkillTemplates", () => {
  test("rejects an invalid agent effort, naming the skill source", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude"] } };',
    });

    const config = await loadConfig(project.root);

    expect(() => getSkillTemplates(config)).toThrow(
      /\/skills\/broken\.md skill metadata[\s\S]*received "extreme"[\s\S]*agent\.effort/,
    );
  });
});
