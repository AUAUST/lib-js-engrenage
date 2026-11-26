import { keys } from "@auaust/toolkit/object";

import {
  stripExternalWriteMarker,
  stripHeaderChain,
  type IssueContract,
} from "#tools/github/issues/contract/index";
import { localizeReferences } from "#tools/github/issues/drafts/utils/localizeReferences";
import { splitBodySections } from "#tools/github/issues/drafts/utils/splitBodySections";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function toDraftBody(
  body: string,
  source: string | undefined,
  context: Pick<DraftsContext, "repository" | "registry">,
  contract: IssueContract | undefined,
): string {
  const generated = new Set(keys(contract?.generated ?? {}));

  const kept = splitBodySections(body)
    .filter(({ name }) => {
      return name === undefined || !generated.has(name);
    })
    .flatMap(({ lines }) => lines)
    .join("\n");

  const stripped = stripExternalWriteMarker(stripHeaderChain(kept)).trim();

  return localizeReferences(stripped, source, context);
}
