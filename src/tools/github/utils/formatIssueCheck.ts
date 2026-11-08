import type { IssueCheck } from "#tools/github/types/IssueCheck";

export function formatIssueCheck(
  number: number,
  { findings, openSubIssues }: IssueCheck,
): readonly string[] {
  if (openSubIssues.length === 0) {
    return findings.length === 0
      ? [`#${number} ready`]
      : findings.map(({ message }) => `#${number} ${message}`);
  }

  const subject = `#${number} itself:`;

  return [
    `#${number} has open sub-issues to walk first: ${openSubIssues.map((sub) => `#${sub}`).join(", ")}`,
    ...(findings.length === 0
      ? [`${subject} ready`]
      : findings.map(({ message }) => `${subject} ${message}`)),
  ];
}
