import { boolean, optional, picklist, record, union } from "valibot";

import type { Convention } from "#eslint/types/Convention";

export function registrySchema<Name extends string>(
  registry: Record<Name, Convention>,
) {
  const names: Name[] = [];

  for (const name in registry) {
    names.push(name);
  }

  return optional(union([boolean(), record(picklist(names), boolean())]), true);
}
