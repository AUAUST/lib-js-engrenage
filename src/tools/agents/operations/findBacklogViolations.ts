import {
  array,
  check,
  exactOptional,
  getDotPath,
  minLength,
  nonEmpty,
  pipe,
  regex,
  safeParse,
  strictObject,
  string,
  union,
  unknown,
  type BaseIssue,
} from "valibot";

import { isArray, isPlainObject, isString } from "@auaust/toolkit";

import { backlogDetailKeys, backlogDetailLimit } from "#tools/agents/constants";
import { readBacklogCategories } from "#tools/agents/operations/readBacklogCategories";
import { countWords } from "#tools/agents/utils/countWords";
import { formatBudgetFinding } from "#tools/agents/utils/formatBudgetFinding";
import { isBacklogId } from "#tools/agents/utils/isBacklogId";
import type { Filesystem } from "#foundation/filesystem/index";

function strictMessage(issue: BaseIssue<unknown>): string {
  return issue.expected === "never"
    ? `unknown key ${issue.received}`
    : `expected an object, received ${issue.received}`;
}

const textSchema = pipe(string(), nonEmpty("expected text"));

const detailSchema = union(
  [textSchema, pipe(array(textSchema), minLength(1, "expected items"))],
  "expected text or a list of texts",
);

const sitePattern = /^([^\s:]+):[1-9]\d*$/u;

const categorySchema = strictObject(
  {
    purpose: textSchema,
    entries: array(unknown()),
  },
  strictMessage,
);

const entrySchema = strictObject(
  {
    id: pipe(
      string(),
      check(isBacklogId, "expected an ID as YYMMDD-xxxx, 4 hex characters"),
    ),
    title: textSchema,
    sites: exactOptional(
      pipe(
        array(pipe(string(), regex(sitePattern, "expected <path>:<line>"))),
        minLength(1, "expected sites"),
      ),
    ),
    why: exactOptional(detailSchema),
    want: exactOptional(detailSchema),
    done: exactOptional(detailSchema),
  },
  strictMessage,
);

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

function countDetails(entry: Record<string, unknown>): number {
  let count = 0;

  for (const key of backlogDetailKeys) {
    const value = entry[key];

    count += isArray(value) ? value.length : Number(isString(value));
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

    const parsed = safeParse(categorySchema, category.data);

    if (!parsed.success) {
      violations.push(...formatIssues(file, parsed.issues));

      continue;
    }

    for (const [index, raw] of parsed.output.entries.entries()) {
      const id = isPlainObject(raw) && isString(raw.id) ? raw.id : undefined;

      const subject = `${file}: entry ${id ?? `#${index + 1}`}`;

      const details = isPlainObject(raw) ? countDetails(raw) : 0;

      if (details > backlogDetailLimit) {
        violations.push(
          `${subject}: ${details} why, want and done items, over ${backlogDetailLimit}`,
        );
      }

      const entry = safeParse(entrySchema, raw);

      if (!entry.success) {
        violations.push(...formatIssues(subject, entry.issues));

        continue;
      }

      const { output } = entry;

      const owner = owners.get(output.id);

      if (owner === undefined) {
        owners.set(output.id, file);
      } else {
        violations.push(`${subject}: ID already held by an entry of ${owner}`);
      }

      for (const site of output.sites ?? []) {
        const [, path = ""] = sitePattern.exec(site) ?? [];

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
