// @debt A checkout with no current repository reads every draft as its own, so a draft written there for another repository gets neither the section refusals nor the marker.
export function isExternalWrite(
  repository: string,
  current: string | undefined,
): current is string {
  return (
    current !== undefined && repository.toLowerCase() !== current.toLowerCase()
  );
}
