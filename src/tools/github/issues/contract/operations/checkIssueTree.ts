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
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";
import type { IssueCommit } from "#tools/git/index";
import type { IssueAccess } from "#tools/github/issues/contract/types/IssueAccess";
import type { IssueTree } from "#tools/github/issues/contract/types/IssueTree";
import type { IssueTreeCheck } from "#tools/github/issues/contract/types/IssueTreeCheck";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";
import type { WalkedIssue } from "#tools/github/issues/contract/types/WalkedIssue";
import type { Directory } from "#types/Directory";

interface PlacedIssue {
  readonly tree: IssueTree;
  readonly parsed: ParsedIssueBody;
  readonly ancestors: readonly number[];
  readonly depth: number;
}

function placeInWalkOrder(
  tree: IssueTree,
  ancestors: readonly number[],
  plan: string,
  depth = 0,
): PlacedIssue[] {
  const below = tree.issue.type === plan
    ? [tree.issue.number]
    : [...ancestors, tree.issue.number];

  return [
    ...tree.subIssues.flatMap((sub) => {
      return placeInWalkOrder(sub, below, plan, depth + 1);
    }),
    {
      tree,
      parsed: parseIssueBody(tree.issue.body),
      ancestors,
      depth,
    },
  ];
}

function isClosed(
  { state, number }: { readonly state: string; readonly number: number },
  closes: ReadonlyMap<number, IssueCommit>,
) {
  return state === "closed" || closes.has(number);
}

export async function checkIssueTree(
  access: IssueAccess,
  number: number,
  { root }: { root?: Directory } = {},
): Promise<IssueTreeCheck> {
  const [{ tree, ancestors }, commits] = await Promise.all([
    fetchIssueTree(access, number),
    root === undefined ? [] : listLocalCommits(root, access.repository),
  ]);

  const closes = findClosingCommits(commits);

  const placed = placeInWalkOrder(tree, ancestors, access.protocol.types.plan);

  const known = new Set([
    ...ancestors,
    ...placed.map(({ tree: { issue } }) => issue.number),
  ]);

  const missing = new Set(
    await findMissingReferences(access, [
      ...new Set(
        placed.flatMap(({ parsed }) => {
          return parsed.references.filter((reference) => !known.has(reference));
        }),
      ),
    ]),
  );

  const walked = placed.map(
    ({ tree: { issue }, parsed, ancestors: chain, depth }) => {
      const closedBy = issue.state === "open"
        ? closes.get(issue.number)
        : undefined;

      const report: WalkedIssue = {
        number: issue.number,
        depth,
        type: issue.type,
        state: issue.state,
        closedBy,
        blockers: issue.blockers,
        findings: isClosed(issue, closes)
          ? []
          : [
              ...checkIssueBody(issue.body, issue.type, access.protocol),
              ...checkIssueReadiness(
                {
                  issue,
                  protocol: access.protocol,
                  parsed,
                  ancestors: chain,
                  missingReferences: parsed.references.filter((reference) => {
                    return missing.has(reference);
                  }),
                  closes,
                },
                "worker",
              ),
            ],
        openSections: [planningSection, questionsSection].filter((name) => {
          return parsed.sections.some((section) => section.name === name);
        }),
        towards: commits.filter(({ towards }) => {
          return towards.includes(issue.number);
        }),
        closes: commits.filter(({ closes: closed }) => {
          return closed.includes(issue.number);
        }),
      };

      const actionable = (
        !isClosed(issue, closes) &&
        issue.subIssues.every((sub) => isClosed(sub, closes)) &&
        report.findings.length === 0
      );

      return { report, actionable };
    },
  );

  return {
    issues: walked.map(({ report }) => report),
    next: walked.find(({ actionable }) => actionable)?.report.number,
  };
}
