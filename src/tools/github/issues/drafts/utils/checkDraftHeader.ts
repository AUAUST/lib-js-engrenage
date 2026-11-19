import {
  renderHeader,
  type IssueContract,
  type IssueFinding,
} from "#tools/github/issues/contract/index";
import { headerPlaceholder } from "#tools/github/issues/drafts/constants";
import { readDraftHeader } from "#tools/github/issues/drafts/utils/readDraftHeader";

export function checkDraftHeader(
  body: string,
  contract: IssueContract | undefined,
  parent: string | undefined,
): IssueFinding[] {
  const header = readDraftHeader(body);

  if (header !== undefined && /^#(?:\d|\{)/.test(header)) {
    return [
      {
        rule: "header",
        message: `The header starts with a reference: \`publish\` generates the ancestor chain \`${renderHeader(["#<plan>", "…", "#<parent>"], "")}\`, so keep only \`${headerPlaceholder}\`.`,
      },
    ];
  }

  if (contract?.hasHeader !== true || parent === undefined) {
    return [];
  }

  if (header === undefined) {
    return [
      {
        rule: "header",
        message: `\`${parent}\` lists the draft in \`subIssues\` but it has no header line: write \`${headerPlaceholder}\` before the first section.`,
      },
    ];
  }

  if (header.includes("\n")) {
    return [
      {
        rule: "header",
        message: `The text before the first section spans several lines, but \`publish\` reads it as the header line: keep only \`${headerPlaceholder}\` there and move the rest into a section.`,
      },
    ];
  }

  return header === headerPlaceholder
    ? [
        {
          rule: "header",
          message: `The header line is still the placeholder \`${headerPlaceholder}\`: fill in its sections and gist.`,
        },
      ]
    : [];
}
