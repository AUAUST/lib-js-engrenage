import { issueContracts } from "#tools/github/issues/contract/constants";
import { parseIssueList } from "#tools/github/issues/contract/utils/parseIssueList";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

interface SpecContext {
  readonly plan: ParsedIssueBody | "unresolved" | undefined;
  readonly trivial: boolean;
  readonly subIssues: number;
}

const providesPattern = /^([^:\n]+?):\s*\S/;
const testCasePattern = /^\S.*?\s→\s+\S/;

function listItems(parsed: ParsedIssueBody, name: string) {
  const section = parsed.sections.find((found) => found.name === name);

  return section === undefined ? [] : parseIssueList(section.content).items;
}

function listModelHeadings(plan: ParsedIssueBody | undefined) {
  const own = new Set<string>(issueContracts.plan.sections);

  return (plan?.sections ?? [])
    .map(({ name }) => name)
    .filter((name) => !own.has(name));
}

function firstLine(item: string) {
  const [line = ""] = item.split("\n");

  return line;
}

function checkProvides(
  parsed: ParsedIssueBody,
  plan: ParsedIssueBody | undefined,
): IssueFinding[] {
  const headings = listModelHeadings(plan);

  const available = headings.length === 0
    ? "none"
    : headings.map((heading) => `\`${heading}\``).join(", ");

  return listItems(parsed, "Provides").flatMap((item) => {
    const line = firstLine(item);
    const heading = providesPattern.exec(line)?.[1]?.trim();

    if (heading === undefined) {
      return {
        rule: "provides",
        message: `**Provides** line \`${line}\` is not \`<Model heading>: <what it provides>\`: rewrite it; the nearest plan's Model headings: ${available}.`,
      };
    }

    return headings.includes(heading)
      ? []
      : {
          rule: "provides",
          message: `**Provides** names \`${heading}\`, no Model section of the nearest plan: use one of its Model headings: ${available}.`,
        };
  });
}

function checkTests(cases: readonly string[]): IssueFinding[] {
  return cases.flatMap((item) => {
    const line = firstLine(item);

    return testCasePattern.test(line)
      ? []
      : {
          rule: "test-outcome",
          message: `**Tests** case \`${line}\` states no expected outcome: write it as \`- <case> → <expected outcome>\`.`,
        };
  });
}

export function checkIssueSpec(
  parsed: ParsedIssueBody,
  { plan, trivial, subIssues }: SpecContext,
): IssueFinding[] {
  const cases = listItems(parsed, "Tests");

  const findings = [
    ...(plan === "unresolved" ? [] : checkProvides(parsed, plan)),
    ...checkTests(cases),
  ];

  if (
    trivial &&
    subIssues === 0 &&
    listItems(parsed, "Done when").length <= 1 &&
    cases.length <= 1
  ) {
    findings.push({
      rule: "leaf-floor",
      message: "A trivial leaf with at most one **Done when** clause and one **Tests** case: merge into a sibling.",
      severity: "warning",
    });
  }

  return findings;
}
