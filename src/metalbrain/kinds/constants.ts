import { freeze } from "@auaust/toolkit/object";

import { backlog } from "#metalbrain/backlog/constants";
import { logKinds } from "#metalbrain/logs/constants";
import type { RecordKind } from "#metalbrain/records/index";

export const recordKinds = freeze([
  backlog,
  ...logKinds,
] as const) satisfies readonly RecordKind[];
