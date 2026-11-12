import {
  planningSection,
  questionsSection,
} from "#tools/github/issues/contract/constants";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";
import type { IssueProtocol } from "#tools/github/issues/contract/types/IssueProtocol";

export function checkBlockersField(
  openSections: readonly string[],
  blockers: readonly string[],
  protocol: IssueProtocol,
): IssueFinding[] {
  const blockersField = protocol.fields.blockers;
  const questionsOption = protocol.options.questions;
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
