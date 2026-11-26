import { array, looseObject, string } from "valibot";

import {
  isMissingError,
  readJsonFile,
  resolveWithin,
} from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { buildSourcesFile } from "#project/build/constants";
import { digestSources } from "#project/build/operations/digestSources";
import type { BuildSourcesState } from "#project/build/types/BuildSourcesState";
import type { Directory } from "#types/Directory";

const recordSchema = looseObject({
  sources: array(string()),
  digest: string(),
});

async function readRecord(path: string) {
  try {
    return validate(recordSchema, await readJsonFile(path), path);
  } catch (error) {
    if (isMissingError(error)) {
      return;
    }

    throw error;
  }
}

/**
 * Whether the build of the project at `root` still matches the sources its record
 * lists, comparing their contents: `"unrecorded"` without a record, `"stale"`
 * once a listed source changed or disappeared.
 */
export async function checkBuildSources(
  root: Directory,
): Promise<BuildSourcesState> {
  const record = await readRecord(resolveWithin(root, buildSourcesFile));

  if (record === undefined) {
    return "unrecorded";
  }

  try {
    return (await digestSources(root, record.sources)) === record.digest
      ? "fresh"
      : "stale";
  } catch (error) {
    if (isMissingError(error)) {
      return "stale";
    }

    throw error;
  }
}
