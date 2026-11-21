import { entries } from "@auaust/toolkit/object";

import { issueContracts } from "#tools/github/issues/contract/constants";
import {
  checkBlockersField,
  checkIssueAudience,
  checkIssueContract,
  listOpenSections,
  parseIssueBody,
  type ContractMeaning,
  type ContractNames,
  type IssueAudience,
  type IssueContract,
  type IssueFinding,
} from "#tools/github/issues/contract/index";

export function checkDraftBody(
  body: string,
  meaning: ContractMeaning | undefined,
  blockers: readonly string[],
  contractNames: ContractNames,
  {
    subIssues,
    complete,
    audience,
  }: {
    subIssues: number;
    complete: boolean;
    audience?: IssueAudience | undefined;
  },
): IssueFinding[] {
  const contract:
    | IssueContract
    | undefined = meaning === undefined ? undefined : issueContracts[meaning];

  const generated = contract?.generated ?? {};

  const parsed = parseIssueBody(body);
  const { sections } = parsed;
  const names = new Set(sections.map(({ name }) => name));

  return [
    ...checkIssueContract(body, meaning, contractNames, {
      subIssues,
      complete,
      draft: true,
    }),
    ...(audience === undefined
      ? []
      : checkIssueAudience(
          meaning,
          parsed,
          subIssues,
          audience,
          contractNames,
        )),
    ...checkBlockersField(listOpenSections(parsed), blockers, contractNames),
    ...sections
      .filter(({ content }) => content === "")
      .map(({ name }) => {
        return {
          rule: "empty-section",
          message: `**${name}** is empty: fill it or remove it.`,
        };
      }),
    ...entries(generated)
      .filter(([name]) => names.has(name))
      .map(([name, source]) => {
        return {
          rule: "generated-section",
          message: `**${name}** is generated at publish from ${source}: remove it from the body.`,
        };
      }),
  ];
}
