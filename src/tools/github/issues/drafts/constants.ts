import { iterable, object } from "@auaust/toolkit";

import { closeReasonMeanings } from "#tools/github/issues/contract/constants";
import type { Directory } from "#types/Directory";

export const issueDraftsDirectory = ".ai/issues/" satisfies Directory;

export const draftExtension = ".draft.md";

export const fetchedExtension = ".md";

export const newDraftPrefix = "new-";

export const quoteReferenceHint = 'write the reference quoted, as `"#{new-<slug>}"` or `"#123"`: YAML reads an unquoted `#` as a comment';

export const reservedKeys = object.freeze([
  "title",
  "type",
  "labels",
  "subIssues",
  "blockedBy",
  "state",
  "claim",
] as const);

export const draftStates = object.freeze([
  "open",
  ...iterable.map(object.values(closeReasonMeanings), ({ name }) => name),
] as const);

export const claimStates = object.freeze(["existing"] as const);

export const closeReasonParameters = object.freeze({
  "completed": "completed",
  "not planned": "not_planned",
  "duplicate": "duplicate",
} as const) satisfies Readonly<Record<Exclude<(typeof draftStates)[number], "open">, string>>;

export const issueTypeMutation = `mutation($issueId: ID!, $issueTypeId: ID!) {
  updateIssueIssueType(input: { issueId: $issueId, issueTypeId: $issueTypeId }) {
    issue { number }
  }
}`;

export const headerPlaceholder = "<sections>: <gist>";

export const chainSeparator = " › ";

export const headerSeparator = " · ";
