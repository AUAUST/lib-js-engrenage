import { newDraftPrefix } from "#tools/github/issues/drafts/constants";
import { isSlug } from "#tools/github/issues/drafts/utils/isSlug";
import type { DraftReference } from "#tools/github/issues/drafts/types/DraftReference";

export function parseStem(stem: string): DraftReference | undefined {
  const parts = stem.split(".");

  const [short, target] = parts.length === 2 ? parts : [undefined, stem];

  if (
    target === undefined ||
    parts.length > 2 ||
    (short !== undefined && !isSlug(short))
  ) {
    return;
  }

  if (/^\d+$/.test(target)) {
    return {
      kind: "issue",
      short,
      number: Number(target),
    };
  }

  return target.startsWith(newDraftPrefix) &&
    isSlug(target.slice(newDraftPrefix.length))
    ? {
        kind: "draft",
        short,
        stem: target,
      }
    : undefined;
}
