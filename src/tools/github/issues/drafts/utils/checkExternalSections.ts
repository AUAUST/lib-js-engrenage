import {
  parseIssueBody,
  type IssueContract,
  type IssueFinding,
} from "#tools/github/issues/contract/index";
import { isExternalWrite } from "#tools/github/issues/drafts/utils/isExternalWrite";

export function checkExternalSections(
  body: string,
  contract: IssueContract | undefined,
  repository: string,
  current: string | undefined,
): IssueFinding[] {
  const allowed = contract?.externalSections;

  if (
    contract === undefined ||
    allowed === undefined ||
    !isExternalWrite(repository, current)
  ) {
    return [];
  }

  const kept = new Intl.ListFormat("en", { type: "conjunction" }).format(
    allowed.map((name) => `**${name}**`),
  );

  return parseIssueBody(body)
    .sections.filter(({ name }) => {
      return contract.sections.includes(name) && !allowed.includes(name);
    })
    .map(({ name }) => {
      return {
        rule: "external-section",
        message: `**${name}** states a cause, mechanism or approach in ${repository}'s code, which ${repository}'s agents settle: a draft written from ${current} keeps only ${kept}, stating the symptoms you see and the outcome you need. Delete **${name}**.`,
      };
    });
}
