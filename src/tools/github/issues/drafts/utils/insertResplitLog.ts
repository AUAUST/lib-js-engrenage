import {
  issueContracts,
  resplitSection,
} from "#tools/github/issues/contract/constants";
import { parseIssueBody } from "#tools/github/issues/contract/index";
import { insertSection } from "#tools/github/issues/drafts/utils/insertSection";
import { splitBodySections } from "#tools/github/issues/drafts/utils/splitBodySections";

function readLog(body: string | undefined) {
  const section = body === undefined
    ? undefined
    : parseIssueBody(body).sections.find(({ name }) => name === resplitSection);

  return (section?.content ?? "").split("\n").filter((line) => {
    return line.trim() !== "";
  });
}

export function insertResplitLog(
  body: string,
  previous: string | undefined,
  lines: readonly string[],
): string {
  const logged = readLog(previous);

  const log = [...logged, ...lines.filter((line) => !logged.includes(line))];

  if (log.length === 0) {
    return body;
  }

  const rest = splitBodySections(body)
    .filter(({ name }) => name !== resplitSection)
    .flatMap((section) => section.lines)
    .join("\n");

  return insertSection(
    rest,
    resplitSection,
    log.join("\n"),
    issueContracts.plan.sections,
  );
}
