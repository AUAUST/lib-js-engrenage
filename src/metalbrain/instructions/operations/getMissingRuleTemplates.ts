import { values } from "@auaust/toolkit/object";

import { attributionRules } from "#metalbrain/instructions/constants";
import { getRuleReferences } from "#metalbrain/instructions/operations/getRuleReferences";
import { getRuleTemplates } from "#metalbrain/instructions/operations/getRuleTemplates";
import type { Filesystem } from "#foundation/filesystem/index";
import type { FragmentSources } from "#metalbrain/facts/index";
import type { FragmentRenderer } from "#metalbrain/instructions/types/FragmentRenderer";

export async function getMissingRuleTemplates({
  filesystem,
  fragments,
  renderer,
}: {
  filesystem: Filesystem;
  fragments: FragmentSources;
  renderer: FragmentRenderer;
}) {
  const [references, templates] = await Promise.all([
    getRuleReferences({ filesystem }),
    getRuleTemplates({ fragments, renderer }),
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
