/**
 * The repository `registry` maps `short` to.
 *
 * @throws {Error} When `registry` has no `short`, ending with `hint` when given.
 */
export function findRegisteredRepository(
  registry: ReadonlyMap<string, string>,
  short: string,
  hint?: string,
): string {
  const repository = registry.get(short);

  if (repository === undefined) {
    throw new Error(
      [
        `Unknown repository short name \`${short}\``,
        `registered: ${[...registry.keys()].join(", ") || "none"}`,
        ...(hint === undefined ? [] : [hint]),
      ].join("; "),
    );
  }

  return repository;
}
