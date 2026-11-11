export function findRegisteredRepository(
  registry: ReadonlyMap<string, string>,
  short: string,
): string {
  const repository = registry.get(short);

  if (repository === undefined) {
    throw new Error(
      `Unknown repository short name \`${short}\`; registered: ${[...registry.keys()].join(", ") || "none"}`,
    );
  }

  return repository;
}
