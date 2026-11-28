import { logKinds } from "#metalbrain/logs/constants";

/**
 * The log kind named `name`.
 *
 * @throws {Error} When no log kind holds `name`.
 */
export function findLogKind(name: string): (typeof logKinds)[number] {
  const kind = logKinds.find((candidate) => candidate.name === name);

  if (kind === undefined) {
    throw new Error(
      `No log kind "${name}": expected one of ${logKinds
        .map((candidate) => {
          return candidate.name;
        })
        .join(", ")}`,
    );
  }

  return kind;
}
