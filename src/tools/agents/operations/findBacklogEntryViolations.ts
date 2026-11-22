import { isString } from "@auaust/toolkit";

import { backlogDetailKeys, backlogDetailLimit } from "#tools/agents/constants";
import { countWords } from "#tools/agents/utils/countWords";
import { formatBudgetFinding } from "#tools/agents/utils/formatBudgetFinding";
import { formatSchemaIssues } from "#tools/agents/utils/formatSchemaIssues";
import type { Filesystem } from "#foundation/filesystem/index";
import type { parseBacklogCategory } from "#tools/agents/utils/parseBacklogCategory";

type BacklogEntry = Extract<
  ReturnType<typeof parseBacklogCategory>,
  { kind: "parsed" }
>["entries"][number];

function countDetails({ loose }: BacklogEntry): number {
  let count = 0;

  for (const key of backlogDetailKeys) {
    const value = loose[key];

    if (value !== undefined) {
      count += isString(value) ? 1 : value.length;
    }
  }

  return count;
}

/**
 * Each departure of one backlog entry, named `subject`, from the backlog file
 * schema, apart from an ID another entry holds: more than three `why`, `want`
 * and `done` items, a key the schema lacks, a value of the wrong form, a site
 * naming no file or more than `budget` words.
 */
export async function findBacklogEntryViolations(
  filesystem: Filesystem,
  subject: string,
  entry: BacklogEntry,
  budget: number,
): Promise<string[]> {
  const violations: string[] = [];

  const details = countDetails(entry);

  if (details > backlogDetailLimit) {
    violations.push(
      `${subject}: ${details} why, want and done items, over ${backlogDetailLimit}`,
    );
  }

  if (!entry.valid) {
    return [...violations, ...formatSchemaIssues(subject, entry.issues)];
  }

  const output = entry.entry;

  for (const site of output.sites ?? []) {
    const [path = ""] = site.split(":");

    if (!(await filesystem.exists(path))) {
      violations.push(
        `${subject}: site \`${path}\` names no file: write its path from the project root, or follow the file it moved to`,
      );
    }
  }

  const prose = [
    output.title,
    ...backlogDetailKeys.flatMap((key) => {
      return output[key] ?? [];
    }),
  ];

  const words = countWords(prose.join("\n"));

  if (words > budget) {
    violations.push(
      formatBudgetFinding({
        subject,
        kind: "backlogEntry",
        words,
        budget,
      }),
    );
  }

  return violations;
}
