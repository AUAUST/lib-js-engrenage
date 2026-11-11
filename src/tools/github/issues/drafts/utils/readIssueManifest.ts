import { entries, record } from "@auaust/toolkit/object";

import { issueContracts } from "#tools/github/issues/contract/constants";
import {
  findContractMeaning,
  parseIssueBody,
  type FetchedIssue,
  type IssueContract,
  type IssueProtocol,
} from "#tools/github/issues/contract/index";
import { closeReasonParameters } from "#tools/github/issues/drafts/constants";
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

function listSubIssues(
  issue: FetchedIssue,
  contract: IssueContract | undefined,
) {
  const roadmap = parseIssueBody(issue.body).roadmap;

  return issue.subIssues.map(({ number }): RoadmapEntry | string => {
    if (contract?.subIssues !== "roadmap") {
      return `#${number}`;
    }

    const line = roadmap.find((entry) => entry.number === number);

    return {
      ref: `#${number}`,
      gist: line?.gist ?? "",
      sections: line?.sections ?? [],
    };
  });
}

export function readIssueManifest(
  issue: FetchedIssue,
  target: ManifestTarget,
  protocol: IssueProtocol,
): Readonly<Record<string, unknown>> {
  const fields = (
    target.types.find(({ name }) => {
      return name === issue.type;
    })?.fields ?? []
  );

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
    subIssues: listSubIssues(issue, contract),
    blockedBy: issue.blockedBy.map(({ number }) => `#${number}`),
    state: readState(issue),
    ...(issue.blockers.includes(protocol.options.drafting)
      ? { claim: "existing" }
      : {}),
  };
}
