export function mergeDraftBody({
  base,
  remote,
  local,
}: {
  readonly base: string;
  readonly remote: string;
  readonly local: string;
}): string | undefined {
  if (local === base || local === remote) {
    return remote;
  }

  return remote === base ? local : undefined;
}
