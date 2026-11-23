import { values } from "@auaust/toolkit/object";

import { attributionRules } from "#metalbrain/instructions/constants";
import { getRuleReferences } from "#metalbrain/instructions/operations/getRuleReferences";
import { getRuleTemplates } from "#metalbrain/instructions/operations/getRuleTemplates";
import type { Filesystem } from "#foundation/filesystem/index";
import type { FragmentRenderer } from "#metalbrain/instructions/types/FragmentRenderer";
import type { InstructionRegistry } from "#metalbrain/instructions/types/InstructionRegistry";

export async function getMissingRuleTemplates({
  filesystem,
  instructions,
  renderer,
}: {
  filesystem: Filesystem;
  instructions: InstructionRegistry;
  renderer: FragmentRenderer;
}) {
  const [references, templates] = await Promise.all([
    getRuleReferences({ filesystem }),
    getRuleTemplates({ instructions, renderer }),
  ]);

  const owned = new Set<string>(values(attributionRules));

  const missing = await Promise.all(
    templates.map(async ({ name, file, reference }) => {
      return (
        !owned.has(name) &&
        !references.has(reference) &&
        !(await filesystem.exists(file))
      );
    }),
  );

  return templates.filter((_, index) => missing[index]);
}
