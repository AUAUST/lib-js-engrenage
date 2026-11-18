import {
  planningSection,
  questionsSection,
} from "#tools/github/issues/contract/constants";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";

export function checkBlockersField(
  openSections: readonly string[],
  blockers: readonly string[],
  contractNames: ContractNames,
): IssueFinding[] {
  const blockersField = contractNames.fields.blockers;
  const questionsOption = contractNames.options.questions;
  const asksQuestions = blockers.includes(questionsOption);

  if (openSections.length > 0 && !asksQuestions) {
    return [
      {
        rule: "stale-field",
        message: `${blockersField} lacks \`${questionsOption}\` although ${openSections
          .map((name) => {
            return `**${name}**`;
          })
          .join(" and ")} is open: set the field.`,
      },
    ];
  }

  if (openSections.length === 0 && asksQuestions) {
    return [
      {
        rule: "stale-field",
        message: `${blockersField} has \`${questionsOption}\` although no **${planningSection}** or **${questionsSection}** is open: clear the field.`,
      },
    ];
  }

  return [];
}
