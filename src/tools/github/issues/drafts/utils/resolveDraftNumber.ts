import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";

export function resolveDraftNumber(
  reference: string,
  numbers: ReadonlyMap<string, number>,
): number {
  const parsed = parseReference(reference);

  const number = parsed?.kind === "issue"
    ? parsed.number
    : parsed?.kind === "draft"
      ? numbers.get(parsed.stem)
      : undefined;

  if (number === undefined) {
    throw new Error(`${reference} has no issue number to publish`);
  }

  return number;
}
