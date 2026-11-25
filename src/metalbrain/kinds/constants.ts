import { freeze } from "@auaust/toolkit/object";

import { backlog } from "#metalbrain/backlog/constants";
import { legacyLogs, logKinds } from "#metalbrain/logs/constants";
import { recordFileExtension } from "#metalbrain/records/constants";
import type { RecordKind } from "#metalbrain/records/index";
import type { Globs } from "#types/Globs";

export const recordKinds = freeze([
  backlog,
  ...logKinds,
] as const) satisfies readonly RecordKind[];

export const recordFiles = freeze([
  ...legacyLogs.map(({ file }) => file),
  ...recordKinds.map(({ location }) => {
    return "directory" in location
      ? `${location.directory}/*${recordFileExtension}`
      : location.file;
  }),
]) satisfies Globs;
