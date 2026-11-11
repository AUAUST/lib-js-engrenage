import { newDraftPrefix } from "#tools/github/issues/drafts/constants";
import { isSlug } from "#tools/github/issues/drafts/utils/isSlug";
import type { DraftReference } from "#tools/github/issues/drafts/types/DraftReference";

function parseTarget(target: string): DraftReference | undefined {
  if (/^\d+$/.test(target)) {
    return { kind: "issue", number: Number(target) };
  }

  return target.startsWith(newDraftPrefix) &&
    isSlug(target.slice(newDraftPrefix.length))
    ? { kind: "draft", stem: target }
    : undefined;
}

export function parseReference(text: string): DraftReference | undefined {
  const issue = /^#(\d+)$/.exec(text)?.[1];

  if (issue !== undefined) {
    return { kind: "issue", number: Number(issue) };
  }

  const inner = /^#\{([^{}\s]+)\}$/.exec(text)?.[1];

  if (inner === undefined) {
    return;
  }

  const [repository, target, ...rest] = inner.split(".");

  if (target === undefined) {
    const parsed = parseTarget(inner);

    return parsed?.kind === "draft" ? parsed : undefined;
  }

  return repository !== undefined &&
    isSlug(repository) &&
    rest.length === 0 &&
    parseTarget(target) !== undefined
    ? {
        kind: "registered",
        repository,
        target,
      }
    : undefined;
}
