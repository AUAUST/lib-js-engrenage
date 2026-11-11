import { syncBlocks } from "#foundation/blocks/index";
import { codexFile, codexSkillsDir } from "#tools/agents/codex/constants";
import { createCodexDispatch } from "#tools/agents/codex/operations/createCodexDispatch";
import { createCodexRuleMapping } from "#tools/agents/codex/operations/createCodexRuleMapping";
import { syncCodexSkill } from "#tools/agents/codex/operations/syncCodexSkill";
import { markdownBlocks } from "#tools/agents/constants";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Extension } from "#project/config/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { SkillDefinition } from "#tools/agents/types/SkillDefinition";

export async function syncCodexInstructions({
  filesystem,
  agents,
  extensions,
}: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
  extensions?: readonly Extension[];
}) {
  if (agents.preferred?.includes("codex") !== true) {
    return;
  }

  const installed: SkillDefinition[] = [];

  for (const template of await getSkillDefinitions(extensions)) {
    const skill = await filesystem.read(
      `${codexSkillsDir}/${template.name}/SKILL.md`,
    );

    if (!skill?.includes(`<!-- @reference ${template.reference} -->`)) {
      continue;
    }

    await syncCodexSkill(filesystem, template);

    installed.push(template);
  }

  const content = await filesystem.read(codexFile);

  if (content === undefined) {
    return;
  }

  const rules = await createCodexRuleMapping({ filesystem });

  await filesystem.write(
    codexFile,
    await syncBlocks(
      content.includes("<!-- @dispatch -->")
        ? content
        : `${content.trimEnd()}\n\n## Dispatch\n\n<!-- @dispatch -->\n<!-- @end -->\n`,
      markdownBlocks,
      {
        dispatch() {
          return createCodexDispatch(installed);
        },
        rules() {
          return rules;
        },
      },
    ),
  );
}
