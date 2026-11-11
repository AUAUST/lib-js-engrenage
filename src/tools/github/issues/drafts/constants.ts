import { map } from "@auaust/primitive-kit/arrays";
import { freeze, values } from "@auaust/toolkit/object";

import { closeReasonMeanings } from "#tools/github/issues/contract/constants";
import type { Directory } from "#types/Directory";

export const issueDraftsDirectory = ".ai/issues/" satisfies Directory;

export const draftExtension = ".draft.md";

export const newDraftPrefix = "new-";

export const reservedKeys = freeze([
  "title",
  "type",
  "labels",
  "subIssues",
  "blockedBy",
  "state",
  "claim",
] as const);

export const draftStates = freeze([
  "open",
  ...map(values(closeReasonMeanings), ({ name }) => name),
] as const);

export const claimStates = freeze(["existing"] as const);
