import { recordKinds } from "#metalbrain/kinds/constants";

/**
 * The record kind named `name`, as in `pnpm metalbrain <name> …`.
 *
 * @throws {Error} When no record kind holds `name`.
 */
export function findNamedRecordKind(
  name: string,
): (typeof recordKinds)[number] {
  const kind = recordKinds.find((candidate) => candidate.name === name);

  if (kind === undefined) {
    throw new Error(
      `No record kind "${name}": expected one of ${recordKinds
        .map((candidate) => candidate.name)
        .join(", ")}`,
    );
  }

  return kind;
}
