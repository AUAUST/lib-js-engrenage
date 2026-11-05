import { values } from "@auaust/toolkit/object";

import { attributionRules } from "#tools/agents/constants";
import { getRuleReferences } from "#tools/agents/operations/getRuleReferences";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import type { Filesystem } from "#foundation/filesystem/index";

export function getMissingRuleTemplates({
  filesystem,
}: {
  filesystem: Filesystem;
}) {
  const references = getRuleReferences({ filesystem });
  const owned = new Set<string>(values(attributionRules));

  return getRuleTemplates().filter(({ name, file, reference }) => {
    return (
      !owned.has(name) && !filesystem.exists(file) && !references.has(reference)
    );
  });
}
