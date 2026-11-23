import { isArray, isString } from "@auaust/toolkit";

import { countWords } from "#foundation/markdown/index";
import { formatSchemaIssues } from "#metalbrain/records/utils/formatSchemaIssues";
import { formatWordCapFinding } from "#metalbrain/records/utils/formatWordCapFinding";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { parseRecordGroup } from "#metalbrain/records/utils/parseRecordGroup";

type RecordEntry = Extract<
  ReturnType<typeof parseRecordGroup>,
  { kind: "parsed" }
>["entries"][number];

function listKeys(kind: RecordKind, type: string): string[] {
  return Object.keys(kind.fields).filter((key) => {
    return kind.fields[key]?.type === type;
  });
}

function toItems(value: string | readonly string[] | undefined) {
  if (value === undefined) {
    return [];
  }

  return isString(value) ? [value] : value;
}

function countDetails(kind: RecordKind, { loose }: RecordEntry): number {
  let count = 0;

  for (const key of listKeys(kind, "detail")) {
    const value = loose[key];

    if (isString(value)) {
      count += 1;
    } else if (isArray(value)) {
      count += value.length;
    }
  }

  return count;
}

/**
 * Each departure of one `kind` entry, named `subject`, from the kind's schema,
 * apart from an ID another entry holds: more detail items than the kind's limit,
 * a key the schema lacks, a value of the wrong form, a site naming no file or
 * more than `wordCap` words.
 */
export async function findRecordEntryViolations(
  filesystem: Filesystem,
  kind: RecordKind,
  subject: string,
  entry: RecordEntry,
  wordCap: number,
): Promise<string[]> {
  const violations: string[] = [];

  const details = countDetails(kind, entry);

  if (details > kind.detailLimit) {
    const keys = listKeys(kind, "detail");

    const names = [keys.slice(0, -1).join(", "), keys.at(-1)]
      .filter(Boolean)
      .join(" and ");

    violations.push(
      `${subject}: ${details} ${names} items, over ${kind.detailLimit}`,
    );
  }

  if (!entry.valid) {
    return [...violations, ...formatSchemaIssues(subject, entry.issues)];
  }

  const output = entry.entry;

  for (const key of listKeys(kind, "sites")) {
    for (const site of toItems(output[key])) {
      const [path = ""] = site.split(":");

      if (!(await filesystem.exists(path))) {
        violations.push(
          `${subject}: site \`${path}\` names no file: write its path from the project root, or follow the file it moved to`,
        );
      }
    }
  }

  const prose = Object.keys(kind.fields)
    .filter((key) => kind.fields[key]?.type !== "sites")
    .flatMap((key) => toItems(output[key]));

  const words = countWords(prose.join("\n"));

  if (words > wordCap) {
    violations.push(
      formatWordCapFinding({
        subject,
        kind: kind.wordCap,
        words,
        cap: wordCap,
      }),
    );
  }

  return violations;
}
