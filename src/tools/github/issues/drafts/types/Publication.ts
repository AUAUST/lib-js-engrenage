import type { LoadedConfig } from "#project/config/index";
import type { IssueAccess } from "#tools/github/issues/contract/index";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { IssueLookup } from "#tools/github/issues/drafts/types/IssueLookup";
import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

export interface Publication {
  readonly config: LoadedConfig;
  readonly context: DraftsContext;
  readonly target: ManifestTarget;
  readonly access: IssueAccess;
  readonly lookup: IssueLookup;
  readonly drafts: readonly PublishedDraft[];
  readonly numbers: Map<string, number>;
}
