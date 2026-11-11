import type {
  ContractMeaning,
  FetchedIssue,
  IssueContract,
} from "#tools/github/issues/contract/index";
import type { Draft } from "#tools/github/issues/drafts/types/Draft";
import type { DraftManifest } from "#tools/github/issues/drafts/types/DraftManifest";

export interface PublishedDraft {
  stem: string;
  body: string;
  remote: FetchedIssue | undefined;
  ancestors: readonly string[];
  readonly draft: Draft;
  manifest: DraftManifest;
  readonly meaning: ContractMeaning | undefined;
  readonly contract: IssueContract | undefined;
}
