import { expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createAgentRulesStep } from "#tools/agents/setup/createAgentRulesStep";
import { createPrompter } from "#workflows/init/operations/createPrompter";
import { createStepContext } from "#workflows/init/operations/createStepContext";

test("offers the default rules of an active extension, preselected", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] }, github: { planning: true } };',
    "AGENTS.md": "Instructions\n",
  });

  const context = await createStepContext({
    config: await loadConfig(project.root),
    prompter: createPrompter({ yes: true }),
  });

  await createAgentRulesStep().plan(context);

  const { filesystem } = context;

  expect(await filesystem.exists(".claude/rules/github.md")).toBe(true);
  expect(await filesystem.exists(".claude/rules/issue-drafts.md")).toBe(true);
});
