import { join } from "node:path";

import { pathExists } from "#foundation/filesystem/index";
import { ShellSyntaxError } from "#foundation/shell/index";
import {
  parseGithubViews,
  type GithubView,
} from "#tools/github/issues/contract/index";
import { findShortName } from "#tools/github/issues/drafts/utils/findShortName";
import { locateFetchedIssue } from "#tools/github/issues/drafts/utils/locateFetchedIssue";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { Directory } from "#types/Directory";

const copiedFields = new Set(["number", "title", "body", "labels", "state"]);

function readsOnlyCopy({ fields, comments }: GithubView): boolean {
  return !comments && (fields ?? []).every((field) => copiedFields.has(field));
}

function resolveViewStem(
  { number, repository }: GithubView,
  context: Pick<DraftsContext, "repository" | "registry">,
): string | undefined {
  if (number === undefined) {
    return;
  }

  if (
    repository === undefined ||
    repository.toLowerCase() === context.repository?.toLowerCase()
  ) {
    return String(number);
  }

  const short = findShortName(repository, context);

  return short === undefined ? undefined : `${short}.${number}`;
}

export async function checkIssueViews(
  command: string,
  root: Directory,
  context: Pick<DraftsContext, "repository" | "registry">,
): Promise<string | undefined> {
  let views;

  try {
    views = parseGithubViews(command);
  } catch (error) {
    if (error instanceof ShellSyntaxError) {
      return;
    }

    throw error;
  }

  for (const view of views.filter(readsOnlyCopy)) {
    const stem = resolveViewStem(view, context);

    const copy = stem === undefined ? undefined : locateFetchedIssue(stem);

    if (copy !== undefined && (await pathExists(join(root, copy)))) {
      return `\`gh issue view ${view.number}\`: \`${copy}\` already holds its title, body, labels, state and fields; read it, and its \`.draft.md\` when one exists, instead of fetching it again. Fetch only comments or fields the copy lacks.`;
    }
  }
}
