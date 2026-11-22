import { describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import {
  claudeStopHook,
  claudeThoroughnessHookArgs,
  metalbrainHook,
} from "#tools/agents/claude/constants";
import { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
import { getAgentRuntimes } from "#tools/agents/operations/getAgentRuntimes";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { createHookCommand } from "#tools/agents/utils/createHookCommand";

const skill = vi.hoisted(() => {
  return {
    name: "",
    agent: {},
  };
});

vi.mock(import("#tools/agents/operations/getInstructionTemplates"), () => {
  return {
    getInstructionTemplates: () => {
      return Promise.resolve([
        {
          title: skill.name,
          description: `${skill.name} skill`,
          category: "workflow",
          default: false,
          order: 0,
          name: skill.name,
          source: `/skills/${skill.name}.md`,
          reference: `@auaust/engrenage/metalbrain/skills/${skill.name}.md`,
          body: `# ${skill.name}`,
          paths: undefined,
          supporting: [],
          agent: skill.agent,
        },
      ]);
    },
  };
});

const thoroughnessHook = [
  {
    matcher: "*",
    hooks: [
      {
        type: "command",
        command: createHookCommand(
          `${claudeThoroughnessHookArgs} standard`,
          metalbrainHook,
        ),
      },
    ],
  },
];

function mockSkill(name: string, agent: object) {
  skill.name = name;
  skill.agent = agent;
}

async function renderSkills() {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
  });

  const config = await loadConfig(project.root);

  const agents = await config.resolve("agents");

  return getSkillTemplates({
    agents,
    extensions: [],
    renderer: await createFragmentRenderer(config),
    runtimes: await getAgentRuntimes(config),
  });
}

async function renderAgentFrontmatter() {
  const [template] = await renderSkills();

  return template?.files.find(({ file }) => {
    return file.startsWith(".claude/agents/");
  })?.frontmatter?.values;
}

describe("getSkillTemplates", () => {
  test("retains canonical metadata", async () => {
    mockSkill("implement", {
      name: "worker",
      description: "Canonical worker",
      model: "opus",
      effort: "low",
      efforts: {
        trivial: "low",
        involved: "medium",
        complex: "medium",
      },
      gate: true,
    });

    const [template] = await renderSkills();

    expect(template?.agent).toMatchObject({
      model: "opus",
      gate: true,
    });
  });

  test("rejects an invalid agent effort, naming the skill source", async () => {
    mockSkill("broken", {
      name: "breaker",
      description: "Breaker",
      effort: "extreme",
    });

    await expect(renderSkills()).rejects.toThrow(
      /\/skills\/broken\.md skill metadata[\s\S]*received "extreme"[\s\S]*agent\.effort/,
    );
  });

  test("renders the stop hook for a gated agent, without its gate and efforts keys", async () => {
    mockSkill("gated", {
      name: "worker",
      description: "Worker",
      efforts: { complex: "high" },
      gate: true,
    });

    expect(await renderAgentFrontmatter()).toEqual({
      name: "worker",
      description: "Worker",
      hooks: {
        PreToolUse: thoroughnessHook,
        Stop: [
          {
            hooks: [
              {
                type: "command",
                command: createHookCommand(
                  claudeStopHook.args,
                  claudeStopHook.program,
                ),
              },
            ],
          },
        ],
      },
    });
  });

  test("renders only the thoroughness hook for an ungated agent", async () => {
    mockSkill("ungated", { name: "helper", description: "Helper" });

    expect(await renderAgentFrontmatter()).toEqual({
      name: "helper",
      description: "Helper",
      hooks: { PreToolUse: thoroughnessHook },
    });
  });

  test("renders the tool allowlist into the Claude agent", async () => {
    mockSkill("allowlisted", {
      name: "helper",
      description: "Helper",
      tools: ["Bash", "Read"],
    });

    expect(await renderAgentFrontmatter()).toEqual({
      name: "helper",
      description: "Helper",
      tools: ["Bash", "Read"],
      hooks: { PreToolUse: thoroughnessHook },
    });
  });

  test("rejects a non-string tool, naming the skill source", async () => {
    mockSkill("broken", {
      name: "breaker",
      description: "Breaker",
      tools: ["Bash", 1],
    });

    await expect(renderSkills()).rejects.toThrow(
      /\/skills\/broken\.md skill metadata[\s\S]*agent\.tools/,
    );
  });
});
