import { expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createCodexDispatch } from "#tools/agents/codex/operations/createCodexDispatch";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";

async function getInstalledSkills() {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["codex"] }, github: { planning: true } };',
  });

  const config = await loadConfig(project.root);

  return getSkillDefinitions({
    extensions: await listActiveExtensions(config),
  });
}

function findSkill(
  skills: Awaited<ReturnType<typeof getInstalledSkills>>,
  agent: string,
) {
  const skill = skills.find((definition) => {
    return definition.agent?.name === agent;
  });

  if (skill == null) {
    throw new Error(`No installed skill declares the ${agent} agent`);
  }

  return skill;
}

test("triggers an agent skill on its own description and delegates conditionally", async () => {
  const skills = await getInstalledSkills();

  const debugging = findSkill(skills, "debugger");

  const dispatch = createCodexDispatch([debugging]);

  expect(dispatch).toContain(
    `| \`${debugging.name}\` | ${debugging.description} Delegate to \`debugger\` when its description allows; otherwise run the skill yourself. |`,
  );

  expect(dispatch).not.toContain(debugging.agent?.description);
});

test("runs the planner's skill in the main session", async () => {
  const skills = await getInstalledSkills();

  const planning = findSkill(skills, "planner");

  expect(createCodexDispatch([planning])).toContain(
    `| \`${planning.name}\` | Run its skill in the main session. ${planning.description} |`,
  );
});
