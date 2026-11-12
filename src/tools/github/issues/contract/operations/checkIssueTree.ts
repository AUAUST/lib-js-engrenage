import {
  planningSection,
  questionsSection,
} from "#tools/github/issues/contract/constants";
import { fetchIssueTree } from "#tools/github/issues/contract/operations/fetchIssueTree";
import { findMissingReferences } from "#tools/github/issues/contract/operations/findMissingReferences";
import { listLocalCommits } from "#tools/github/issues/contract/operations/listLocalCommits";
import { checkIssueBody } from "#tools/github/issues/contract/utils/checkIssueBody";
import { checkIssueReadiness } from "#tools/github/issues/contract/utils/checkIssueReadiness";
import { findClosingCommits } from "#tools/github/issues/contract/utils/findClosingCommits";
import { findContractMeaning } from "#tools/github/issues/contract/utils/findContractMeaning";
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";
import type { IssueCommit } from "#tools/git/index";
import type { IssueAccess } from "#tools/github/issues/contract/types/IssueAccess";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";
import type { IssueTree } from "#tools/github/issues/contract/types/IssueTree";
import type { IssueTreeCheck } from "#tools/github/issues/contract/types/IssueTreeCheck";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";
import type { WalkedIssue } from "#tools/github/issues/contract/types/WalkedIssue";
import type { Directory } from "#types/Directory";

interface PlacedIssue {
  readonly tree: IssueTree;
  readonly location: IssueLocation;
  readonly parsed: ParsedIssueBody;
  readonly ancestors: readonly IssueLocation[];
  readonly depth: number;
}

function toKey({ repository, number }: IssueLocation) {
  return `${repository.toLowerCase()}#${number}`;
}

function placeInWalkOrder(
  tree: IssueTree,
  ancestors: readonly IssueLocation[],
  plan: string,
  depth = 0,
): PlacedIssue[] {
  const location = {
    repository: tree.repository,
    number: tree.issue.number,
  };

  const below = tree.issue.type === plan
    ? [location]
    : [...ancestors, location];

  return [
    ...tree.subIssues.flatMap((sub) => {
      return placeInWalkOrder(sub, below, plan, depth + 1);
    }),
    {
      tree,
      location,
      parsed: parseIssueBody(tree.issue.body),
      ancestors,
      depth,
    },
  ];
}

async function findMissing(
  access: IssueAccess,
  placed: readonly PlacedIssue[],
  known: ReadonlySet<string>,
): Promise<ReadonlySet<string>> {
  const unknown = new Map<string, Set<number>>();

  for (const { location, parsed } of placed) {
    for (const number of parsed.references) {
      const reference = { repository: location.repository, number };

      if (known.has(toKey(reference))) {
        continue;
      }

      const numbers = unknown.get(location.repository) ?? new Set();

      unknown.set(location.repository, numbers.add(number));
    }
  }

  const missing = await Promise.all(
    [...unknown].map(async ([repository, numbers]) => {
      const found = await findMissingReferences({ ...access, repository }, [
        ...numbers,
      ]);

      return found.map((number) => toKey({ repository, number }));
    }),
  );

  return new Set(missing.flat());
}

export async function checkIssueTree(
  access: IssueAccess,
  number: number,
  { root }: { root?: Directory } = {},
): Promise<IssueTreeCheck> {
  const { repository } = access;

  const [{ tree, ancestors }, commits] = await Promise.all([
    fetchIssueTree(access, number),
    root === undefined ? [] : listLocalCommits(root, repository),
  ]);

  const closes = findClosingCommits(commits);

  function isLocal(location: IssueLocation) {
    return location.repository.toLowerCase() === repository.toLowerCase();
  }

  function isClosed(issue: IssueLocation & { readonly state: string }) {
    return (
      issue.state === "closed" || (isLocal(issue) && closes.has(issue.number))
    );
  }

  function listCommits(
    location: IssueLocation,
    relation: (commit: IssueCommit) => readonly number[],
  ) {
    return isLocal(location)
      ? commits.filter((commit) => relation(commit).includes(location.number))
      : [];
  }

  const placed = placeInWalkOrder(tree, ancestors, access.protocol.types.plan);

  const missing = await findMissing(
    access,
    placed,
    new Set(
      [
        ...ancestors,
        ...placed.map(({ location }) => {
          return location;
        }),
      ].map(toKey),
    ),
  );

  const walked = placed.map(
    ({ tree: { issue }, location, parsed, ancestors: chain, depth }) => {
      const closed = isClosed({ ...location, state: issue.state });

      const closedBy = issue.state === "open" && isLocal(location)
        ? closes.get(issue.number)
        : undefined;

      const report: WalkedIssue = {
        ...location,
        depth,
        type: issue.type,
        state: issue.state,
        closedBy,
        blockers: issue.blockers,
        findings: closed
          ? []
          : [
              ...checkIssueBody(
                issue.body,
                findContractMeaning(access.protocol, issue.type),
                access.protocol,
              ),
              ...checkIssueReadiness(
                {
                  issue,
                  repository: location.repository,
                  localRepository: repository,
                  protocol: access.protocol,
                  parsed,
                  ancestors: chain,
                  missingReferences: parsed.references.filter((reference) => {
                    return missing.has(
                      toKey({
                        repository: location.repository,
                        number: reference,
                      }),
                    );
                  }),
                  closes,
                },
                "worker",
              ),
            ],
        openSections: [planningSection, questionsSection].filter((name) => {
          return parsed.sections.some((section) => section.name === name);
        }),
        towards: listCommits(location, ({ towards }) => towards),
        closes: listCommits(location, ({ closes: closed }) => closed),
      };

      const actionable = (
        !closed &&
        issue.subIssues.every(isClosed) &&
        report.findings.length === 0
      );

      return { report, actionable };
    },
  );

  const next = walked.find(({ actionable }) => actionable)?.report;

  return {
    repository,
    issues: walked.map(({ report }) => report),
    next: next === undefined
      ? undefined
      : { repository: next.repository, number: next.number },
  };
}
