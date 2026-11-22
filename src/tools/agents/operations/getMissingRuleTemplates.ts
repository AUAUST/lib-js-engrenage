import { values } from "@auaust/toolkit/object";

import {
  getRuleReferences,
  type FragmentRenderer,
} from "#metalbrain/instructions/index";
import { attributionRules } from "#tools/agents/constants";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Extension } from "#project/config/index";

export async function getMissingRuleTemplates({
  filesystem,
  extensions,
  renderer,
}: {
  filesystem: Filesystem;
  extensions: readonly Extension[];
  renderer: FragmentRenderer;
}) {
  const [references, templates] = await Promise.all([
    getRuleReferences({ filesystem }),
    getRuleTemplates({ extensions, renderer }),
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
