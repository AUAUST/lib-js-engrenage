import { values } from "@auaust/toolkit/object";

import { attributionRules } from "#metalbrain/instructions/constants";
import { getMissingRuleTemplates } from "#metalbrain/instructions/operations/getMissingRuleTemplates";
import { getRuleTemplates } from "#metalbrain/instructions/operations/getRuleTemplates";
import type { Filesystem } from "#foundation/filesystem/index";
import type { FragmentRenderer } from "#metalbrain/instructions/types/FragmentRenderer";
import type { InstructionRegistry } from "#metalbrain/instructions/types/InstructionRegistry";

/**
 * Writes the named rule templates the project lacks.
 *
 * @throws {Error} A name is unknown or follows the `agents.attribution` option.
 */
export async function addAgentRules(
  {
    filesystem,
    instructions,
    renderer,
  }: {
    filesystem: Filesystem;
    instructions: InstructionRegistry;
    renderer: FragmentRenderer;
  },
  names: readonly string[],
) {
  const templates = await getRuleTemplates({ instructions, renderer });

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
    instructions,
    renderer,
  });

  for (const { name, file, content } of missing) {
    if (names.includes(name)) {
      await filesystem.write(file, content);
    }
  }
}
