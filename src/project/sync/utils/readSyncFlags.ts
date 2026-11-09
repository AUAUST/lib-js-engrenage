import { boolean, optional } from "valibot";

import { validate } from "#foundation/options/index";
import type { SyncOption } from "#project/sync/types/SyncOption";
import type { SyncTargetFlags } from "#project/sync/types/SyncTargetFlags";

export function readSyncFlags(
  options: readonly SyncOption[],
  values: Readonly<Record<string, unknown>>,
): SyncTargetFlags {
  const flags: Record<string, Record<string, boolean>> = {};

  for (const { target, flag, option } of options) {
    const value = validate(
      optional(boolean()),
      values[option.attributeName()],
      `--${option.name()}`,
    );

    if (value !== undefined) {
      flags[target] = {
        ...flags[target],
        [flag]: value,
      };
    }
  }

  return flags;
}
