import { expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createBacklogStep } from "#tools/metalbrain/setup/createBacklogStep";
import { createPrompter } from "#workflows/init/operations/createPrompter";
import { createStepContext } from "#workflows/init/operations/createStepContext";

test("installs curation and analysis, with the analyser agent, in a project with an active extension", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": [
      "export default {",
      '  agents: { preferred: ["claude"] },',
      '  extensions: [{ name: "fixture-skills", root: new URL("./skills/", import.meta.url), contributes: { "agents.instructions": [{ kind: "skill", name: "guide", category: "fixture" }] } }],',
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
      "description: An extension skill.",
      "---",
      "",
      "# Guide",
      "",
    ].join("\n"),
  });

  const context = await createStepContext({
    config: await loadConfig(project.root),
    prompter: createPrompter({ yes: true }),
  });

  await createBacklogStep().plan(context);

  const { filesystem } = context;

  expect(await filesystem.glob(".claude/skills/*/SKILL.md")).toEqual([
    ".claude/skills/analysis/SKILL.md",
    ".claude/skills/curation/SKILL.md",
  ]);

  expect(await filesystem.glob(".claude/agents/*.md")).toEqual([
    ".claude/agents/analyser.md",
  ]);
});
