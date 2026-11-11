import { entries, record } from "@auaust/toolkit/object";

import { issueContracts } from "#tools/github/issues/contract/constants";
import {
  findContractMeaning,
  parseIssueBody,
  type FetchedIssue,
  type IssueContract,
} from "#tools/github/issues/contract/index";
import { closeReasonParameters } from "#tools/github/issues/drafts/constants";
import { toDraftReference } from "#tools/github/issues/drafts/utils/toDraftReference";
import { toLocalStem } from "#tools/github/issues/drafts/utils/toLocalStem";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";
import type { RoadmapEntry } from "#tools/github/issues/drafts/types/RoadmapEntry";

function readState({ state, stateReason }: FetchedIssue) {
  if (state === "open") {
    return "open";
  }

  const [name = "completed"] = entries(closeReasonParameters)
    .filter(([, parameter]) => parameter === stateReason)
    .map(([state]) => state);

  return name;
}

// @debt the roadmap parser reads only `#<n>` lines, so a Plan's sub-issue in another repository is claimed without its gist and sections
function listSubIssues(
  issue: FetchedIssue,
  contract: IssueContract | undefined,
  context: DraftsContext,
) {
  const roadmap = parseIssueBody(issue.body).roadmap;

  return issue.subIssues.map((child): RoadmapEntry | string => {
    const reference = toDraftReference(toLocalStem(child, context));

    if (contract?.subIssues !== "roadmap") {
      return reference;
    }

    const line = roadmap.find((entry) => reference === `#${entry.number}`);

    return {
      ref: reference,
      gist: line?.gist ?? "",
      sections: line?.sections ?? [],
    };
  });
}

export function readIssueManifest(
  issue: FetchedIssue,
  target: ManifestTarget,
  context: DraftsContext,
): Readonly<Record<string, unknown>> {
  const fields = (
    target.types.find(({ name }) => {
      return name === issue.type;
    })?.fields ?? []
  );

  const { protocol } = context;

  const meaning = findContractMeaning(protocol, issue.type);

  const contract:
    | IssueContract
    | undefined = meaning === undefined ? undefined : issueContracts[meaning];

  return {
    title: issue.title,
    type: issue.type ?? null,
    labels: issue.labels,
    ...record(
      fields.map(({ name, dataType }) => {
        return [
          name,
          issue.fields[name] ?? (dataType === "multi_select" ? [] : null),
        ] as const;
      }),
    ),
    subIssues: listSubIssues(issue, contract, context),
    blockedBy: issue.blockedBy.map((blocker) => {
      return toDraftReference(toLocalStem(blocker, context));
    }),
    state: readState(issue),
    ...(issue.blockers.includes(protocol.options.drafting)
      ? { claim: "existing" }
      : {}),
  };
}
