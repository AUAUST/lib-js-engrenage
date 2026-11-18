import { formatBlockMarker, syncBlocks } from "#foundation/blocks/index";
import { codexFile, codexSkillsDir } from "#tools/agents/codex/constants";
import { createCodexDispatch } from "#tools/agents/codex/operations/createCodexDispatch";
import { createCodexRuleMapping } from "#tools/agents/codex/operations/createCodexRuleMapping";
import { syncCodexSkill } from "#tools/agents/codex/operations/syncCodexSkill";
import { endMarker, markdownBlocks } from "#tools/agents/constants";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Extension } from "#project/config/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { SkillDefinition } from "#tools/agents/types/SkillDefinition";
import type { BlockFillers } from "#types/BlockFillers";

export async function syncCodexInstructions({
  filesystem,
  agents,
  extensions,
  fillers,
}: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
  extensions?: readonly Extension[];
  fillers: BlockFillers;
}) {
  if (agents.preferred?.includes("codex") !== true) {
    return;
  }

  const installed: SkillDefinition[] = [];

  for (const template of await getSkillDefinitions({
    extensions,
    fillers,
  })) {
    const skill = await filesystem.read(
      `${codexSkillsDir}/${template.name}/SKILL.md`,
    );

    if (!skill?.includes(formatReferenceMarker(template.reference))) {
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
      content.includes(formatBlockMarker(markdownBlocks, "dispatch"))
        ? content
        : `${content.trimEnd()}\n\n## Dispatch\n\n${formatBlockMarker(markdownBlocks, "dispatch")}\n${endMarker}\n`,
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
