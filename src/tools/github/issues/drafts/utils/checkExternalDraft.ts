import { issueContracts } from "#tools/github/issues/contract/constants";
import {
  parseIssueBody,
  type ContractMeaning,
  type ContractNames,
  type IssueContract,
  type IssueFinding,
} from "#tools/github/issues/contract/index";
import { isExternalWrite } from "#tools/github/issues/drafts/utils/isExternalWrite";

export function checkExternalDraft(
  body: string,
  meaning: ContractMeaning | undefined,
  {
    repository,
    current,
    created,
    contractNames,
  }: {
    repository: string;
    current: string | undefined;
    created: boolean;
    contractNames: ContractNames;
  },
): IssueFinding[] {
  if (meaning === undefined || !isExternalWrite(repository, current)) {
    return [];
  }

  if (meaning === "plan" && created) {
    return [
      {
        rule: "external-plan",
        message: `A new ${contractNames.types.plan} for ${repository} cannot be drafted from ${current}: planning belongs to the repository owning the work, so ${repository}'s agents plan it. Draft your need as a ${contractNames.types.task} or ${contractNames.types.problem} instead.`,
      },
    ];
  }

  const contract: IssueContract = issueContracts[meaning];

  const allowed = contract.externalSections;

  if (allowed === undefined) {
    // @debt A published Plan of another repository republishes with no section refusals and no marker, so the consumer's own issues in its tree stay publishable; logging the external write elsewhere, such as a GitHub comment, would close this gap.
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
