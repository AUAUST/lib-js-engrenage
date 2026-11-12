import type {
  ContractMeaning,
  FetchedIssue,
  IssueAccess,
  IssueContract,
} from "#tools/github/issues/contract/index";
import type { Draft } from "#tools/github/issues/drafts/types/Draft";
import type { DraftManifest } from "#tools/github/issues/drafts/types/DraftManifest";
import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";

export interface PublishedDraft {
  stem: string;
  readonly origin: string;
  body: string;
  remote: FetchedIssue | undefined;
  ancestors: readonly string[];
  readonly draft: Draft;
  manifest: DraftManifest;
  readonly target: ManifestTarget;
  readonly access: IssueAccess;
  readonly meaning: ContractMeaning | undefined;
  readonly contract: IssueContract | undefined;
}
