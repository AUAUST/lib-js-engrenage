import { values } from "@auaust/toolkit/object";

import { syncCodexInstructions } from "#tools/agents/codex/index";
import { attributionRules } from "#tools/agents/constants";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { BlockFillers } from "#types/BlockFillers";

export async function addAgentRules(
  {
    filesystem,
    agents,
    fillers,
    config,
  }: {
    filesystem: Filesystem;
    agents: ResolvedAgents;
    fillers: BlockFillers;
    config: LoadedConfig;
  },
  names: readonly string[],
) {
  const extensions = await listActiveExtensions(config);

  const templates = await getRuleTemplates({ extensions, fillers });

  const owned = new Set<string>(values(attributionRules));

  for (const name of names) {
    if (owned.has(name)) {
      throw new Error(
        `The "${name}" agent rule follows the agents.attribution option; set that option and run engrenage sync instead`,
      );
    }

    if (!templates.some((template) => template.name === name)) {
      throw new Error(
        `Unknown agent rule "${name}". Available rules: ${templates
          .map((template) => {
            return template.name;
          })
          .join(", ")}`,
      );
    }
  }

  const missing = await getMissingRuleTemplates({
    filesystem,
    extensions,
    fillers,
  });

  for (const { name, file, content } of missing) {
    if (names.includes(name)) {
      await filesystem.write(file, content);
    }
  }

  await syncCodexInstructions({
    filesystem,
    agents,
    fillers,
    config,
  });
}
