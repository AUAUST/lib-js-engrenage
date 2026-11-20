import { fetchIssueTree } from "#tools/github/issues/contract/operations/fetchIssueTree";
import { findMissingReferences } from "#tools/github/issues/contract/operations/findMissingReferences";
import { listLocalCommits } from "#tools/github/issues/contract/operations/listLocalCommits";
import { checkIssueContract } from "#tools/github/issues/contract/utils/checkIssueContract";
import { checkIssueReadiness } from "#tools/github/issues/contract/utils/checkIssueReadiness";
import { checkNesting } from "#tools/github/issues/contract/utils/checkNesting";
import { findContractMeaning } from "#tools/github/issues/contract/utils/findContractMeaning";
import { findIssueAudience } from "#tools/github/issues/contract/utils/findIssueAudience";
import { findTypeMeaning } from "#tools/github/issues/contract/utils/findTypeMeaning";
import { listOpenSections } from "#tools/github/issues/contract/utils/listOpenSections";
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";
import type { IssueAccess } from "#tools/github/issues/contract/types/IssueAccess";
import type { IssueCheckout } from "#tools/github/issues/contract/types/IssueCheckout";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";
import type { IssueTree } from "#tools/github/issues/contract/types/IssueTree";
import type { IssueTreeCheck } from "#tools/github/issues/contract/types/IssueTreeCheck";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";
import type { WalkedIssue } from "#tools/github/issues/contract/types/WalkedIssue";

interface PlacedIssue {
  readonly tree: IssueTree;
  readonly location: IssueLocation;
  readonly parsed: ParsedIssueBody;
  readonly ancestors: readonly IssueLocation[];
  readonly depth: number;
  readonly inTurn: boolean;
  readonly parentType?: string | undefined;
}

function toKey({ repository, number }: IssueLocation) {
  return `${repository.toLowerCase()}#${number}`;
}

function placeInWalkOrder(
  tree: IssueTree,
  ancestors: readonly IssueLocation[],
  {
    types,
    isClosed,
    planDepth,
  }: {
    types: ContractNames["types"];
    isClosed(issue: IssueLocation & { readonly state: string }): boolean;
    planDepth: number;
  },
  inTurn = true,
  depth = 0,
  parentType?: string,
  nestedPlans = 0,
): PlacedIssue[] {
  const location = {
    repository: tree.repository,
    number: tree.issue.number,
  };

  const isPlan = tree.issue.type === types.plan;

  const plans = depth > 0 && isPlan ? nestedPlans + 1 : nestedPlans;

  const walked = inTurn && plans < Math.max(planDepth, 1);

  const below = isPlan ? [location] : [...ancestors, location];

  return [
    ...tree.subIssues.flatMap((sub, index) => {
      const subInTurn = (
        walked &&
        (tree.issue.type === types.segment ||
          tree.subIssues.slice(0, index).every((earlier) => {
            return isClosed({
              repository: earlier.repository,
              number: earlier.issue.number,
              state: earlier.issue.state,
            });
          }))
      );

      return placeInWalkOrder(
        sub,
        below,
        {
          types,
          isClosed,
          planDepth,
        },
        subInTurn,
        depth + 1,
        tree.issue.type,
        plans,
      );
    }),
    {
      tree,
      location,
      parsed: parseIssueBody(tree.issue.body),
      ancestors,
      depth,
      inTurn: walked,
      parentType,
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
  {
    checkouts = [],
    planDepth = 1,
  }: { checkouts?: readonly IssueCheckout[]; planDepth?: number } = {},
): Promise<IssueTreeCheck> {
  const { repository } = access;

  const [{ tree, ancestors }, commits] = await Promise.all([
    fetchIssueTree(access, number),
    listLocalCommits(checkouts),
  ]);

  function isClosed(issue: IssueLocation & { readonly state: string }) {
    return issue.state === "closed" || commits.closedBy(issue) !== undefined;
  }

  const placed = placeInWalkOrder(tree, ancestors, {
    types: access.contractNames.types,
    isClosed,
    planDepth,
  });

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
    ({
      tree: { issue },
      location,
      parsed,
      ancestors: chain,
      depth,
      inTurn,
      parentType,
    }) => {
      const closed = isClosed({ ...location, state: issue.state });

      const audience = findIssueAudience(
        findTypeMeaning(access.contractNames, issue.type),
        parsed,
      );

      const closedBy = issue.state === "open"
        ? commits.closedBy(location)
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
              ...checkNesting(
                findContractMeaning(access.contractNames, issue.type),
                findContractMeaning(access.contractNames, parentType),
              ),
              ...checkIssueContract(
                issue.body,
                findContractMeaning(access.contractNames, issue.type),
                access.contractNames,
                { subIssues: issue.subIssues.length, complete: true },
              ),
              ...checkIssueReadiness(
                {
                  issue,
                  repository: location.repository,
                  currentRepository: repository,
                  contractNames: access.contractNames,
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
                  commits,
                  // @debt `checkIssueReadiness` skips prerequisites, the header chain and missing references for a debugger outside dispatch, so the walk passes `dispatch` for a debugger leaf to match the hook; readiness could take the checks it runs apart from the audience.
                  dispatch: audience === "debugger",
                },
                audience,
              ),
            ],
        openSections: listOpenSections(parsed),
        towards: commits.towards(location),
        closes: commits.closes(location),
      };

      const ready = (
        inTurn &&
        !closed &&
        issue.subIssues.every(isClosed) &&
        report.findings.length === 0
      );

      return {
        report,
        audience,
        ready,
      };
    },
  );

  return {
    repository,
    checkouts,
    issues: walked.map(({ report }) => report),
    ready: walked
      .filter(({ ready }) => ready)
      .map(({ report, audience }) => {
        return {
          repository: report.repository,
          number: report.number,
          audience,
        };
      }),
    finished: isClosed({
      repository: tree.repository,
      number: tree.issue.number,
      state: tree.issue.state,
    }),
  };
}
