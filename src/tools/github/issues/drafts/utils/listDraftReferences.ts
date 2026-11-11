import { isString } from "@auaust/toolkit/isString";

import type { DraftManifest } from "#tools/github/issues/drafts/types/DraftManifest";

export function listDraftReferences(
  entries: DraftManifest["subIssues"],
): readonly string[] {
  return (entries ?? []).map((entry) => {
    return isString(entry) ? entry : entry.ref;
  });
}
