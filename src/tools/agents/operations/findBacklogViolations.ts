import { getDotPath, type BaseIssue } from "valibot";

import { isString } from "@auaust/toolkit";

import { backlogDetailKeys, backlogDetailLimit } from "#tools/agents/constants";
import { readBacklogCategories } from "#tools/agents/operations/readBacklogCategories";
import { countWords } from "#tools/agents/utils/countWords";
import { formatBudgetFinding } from "#tools/agents/utils/formatBudgetFinding";
import type { Filesystem } from "#foundation/filesystem/index";
import type { BacklogCategoryFile } from "#tools/agents/types/BacklogCategoryFile";

type LooseEntry = Extract<
  BacklogCategoryFile,
  { kind: "parsed" }
>["entries"][number]["loose"];

// @debt the unknown-key message and the dot-path issue lines repeat what `validate` in `foundation/options` and `checkDrafts` in `tools/github` each build their own way; one valibot issue formatter would serve all three
function formatIssues(
  subject: string,
  issues: readonly BaseIssue<unknown>[],
): string[] {
  return issues.map((issue) => {
    const path = getDotPath(issue);

    return path === null
      ? `${subject}: ${issue.message}`
      : `${subject}: ${path}: ${issue.message}`;
  });
}

function countDetails(entry: LooseEntry): number {
  let count = 0;

  for (const key of backlogDetailKeys) {
    const value = entry[key];

    if (value !== undefined) {
      count += isString(value) ? 1 : value.length;
    }
  }

  return count;
}

/**
 * Each departure of `.ai/backlog/*.yml` from the backlog file schema: an
 * unparsable file, a key the schema lacks, a value of the wrong form, more than
 * three `why`, `want` and `done` items, an ID another entry holds, a site naming
 * no file or an entry over `budget` words.
 */
export async function findBacklogViolations(
  filesystem: Filesystem,
  budget: number,
): Promise<string[]> {
  const violations: string[] = [];

  const owners = new Map<string, string>();

  for (const category of await readBacklogCategories(filesystem)) {
    const { file } = category;

    if (category.kind === "invalid") {
      violations.push(`${file}: invalid YAML: ${String(category.error)}`);

      continue;
    }

    if (category.issues.length > 0) {
      violations.push(...formatIssues(file, category.issues));

      continue;
    }

    for (const [index, entry] of category.entries.entries()) {
      const subject = `${file}: entry ${entry.loose.id ?? `#${index + 1}`}`;

      const details = countDetails(entry.loose);

      if (details > backlogDetailLimit) {
        violations.push(
          `${subject}: ${details} why, want and done items, over ${backlogDetailLimit}`,
        );
      }

      if (!entry.valid) {
        violations.push(...formatIssues(subject, entry.issues));

        continue;
      }

      const output = entry.entry;

      const owner = owners.get(output.id);

      if (owner === undefined) {
        owners.set(output.id, file);
      } else {
        violations.push(`${subject}: ID already held by an entry of ${owner}`);
      }

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
    }
  }

  return violations;
}
