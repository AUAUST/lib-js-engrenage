import { keys } from "@auaust/toolkit/object";
import { boolean, optional, picklist, record, union } from "valibot";

import type { Convention } from "#eslint/types/Convention";

export function registrySchema<Name extends string>(
  registry: Record<Name, Convention>,
) {
  return optional(
    union([boolean(), record(picklist(keys(registry)), boolean())]),
    true,
  );
}
