import type { RoadmapEntry } from "#tools/github/issues/contract/index";
import type {
  claimStates,
  draftStates,
} from "#tools/github/issues/drafts/constants";

export interface DraftManifest {
  readonly title: string;
  readonly type: string;
  readonly labels?: readonly string[] | undefined;
  readonly subIssues?: readonly (string | RoadmapEntry)[] | undefined;
  readonly blockedBy?: readonly string[] | undefined;
  readonly state?: (typeof draftStates)[number] | undefined;
  readonly claim?: (typeof claimStates)[number] | undefined;
  readonly resplit?: string | undefined;
  readonly [field: string]: unknown;
}
