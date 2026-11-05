import { values } from "@auaust/toolkit/object";

import { attributionRules } from "#tools/agents/constants";
import { getRuleReferences } from "#tools/agents/operations/getRuleReferences";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import type { Filesystem } from "#foundation/filesystem/index";

export async function getMissingRuleTemplates({
  filesystem,
}: {
  filesystem: Filesystem;
}) {
  const [references, templates] = await Promise.all([
    getRuleReferences({ filesystem }),
    getRuleTemplates(),
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
