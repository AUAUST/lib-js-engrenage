import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

export interface Resplit {
  readonly draft: PublishedDraft;
  readonly plan: string;
  readonly reason: string;
}
