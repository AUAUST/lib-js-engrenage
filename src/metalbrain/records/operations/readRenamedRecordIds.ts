import {
  array,
  check,
  minLength,
  pipe,
  record,
  safeParse,
  string,
  union,
} from "valibot";
import { parse } from "yaml";

import { isString } from "@auaust/toolkit";

import { renamedRecordIdsFile } from "#metalbrain/records/constants";
import { formatSchemaIssues } from "#metalbrain/records/utils/formatSchemaIssues";
import { isLegacyRecordId } from "#metalbrain/records/utils/isLegacyRecordId";
import { isRecordId } from "#metalbrain/records/utils/isRecordId";
import type { Filesystem } from "#foundation/filesystem/index";

const idSchema = pipe(
  string(),
  check(isRecordId, "expected an ID as <namespace>-xxxxxx"),
);

const renamedSchema = record(
  pipe(
    string(),
    check(isLegacyRecordId, "expected a former ID as YYMMDD-xxxx"),
  ),
  union(
    [idSchema, pipe(array(idSchema), minLength(2, "expected several IDs"))],
    "expected an ID, or the IDs of entries of several kinds sharing the former ID",
  ),
);

/**
 * Each former entry ID the committed `.ai/renamed-ids.yml` maps to the IDs its
 * entries took when IDs began naming their kind: one, or one per kind whose
 * entries shared the former ID; empty when the file is missing.
 *
 * @throws {Error} When the file is unparsable or departs from its shape.
 */
export async function readRenamedRecordIds(
  filesystem: Filesystem,
): Promise<Map<string, readonly string[]>> {
  const content = await filesystem.read(renamedRecordIdsFile);

  if (content === undefined) {
    return new Map();
  }

  let data: unknown;

  try {
    data = parse(content);
  } catch (error) {
    throw new Error(`${renamedRecordIdsFile}: invalid YAML: ${String(error)}`, {
      cause: error,
    });
  }

  const parsed = safeParse(renamedSchema, data ?? {});

  if (!parsed.success) {
    throw new Error(
      formatSchemaIssues(renamedRecordIdsFile, parsed.issues).join("\n"),
    );
  }

  return new Map(
    Object.entries(parsed.output).map(([former, ids]) => {
      return [former, isString(ids) ? [ids] : ids];
    }),
  );
}
