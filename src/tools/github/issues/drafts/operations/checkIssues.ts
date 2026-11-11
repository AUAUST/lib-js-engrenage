import { isString } from "@auaust/toolkit/isString";

import {
  createGithubClient,
  resolveRepository,
} from "#tools/github/issues/api/index";
import {
  checkIssue,
  formatIssueCheck,
  type IssueAudience,
  type IssueLocation,
} from "#tools/github/issues/contract/index";
import { readDraft } from "#tools/github/issues/drafts/operations/readDraft";
import { resolveDraftsContext } from "#tools/github/issues/drafts/operations/resolveDraftsContext";
import { checkDrafts } from "#tools/github/issues/drafts/utils/checkDrafts";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import type { LoadedConfig } from "#project/config/index";
import type { Draft } from "#tools/github/issues/drafts/types/Draft";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { IssuesCheck } from "#tools/github/issues/drafts/types/IssuesCheck";

async function checkPublished(
  config: LoadedConfig,
  locations: readonly IssueLocation[],
  audience: IssueAudience,
) {
  const { root } = config.context;

  const { protocol } = await config.resolve("github");

  const client = await createGithubClient();

  const lines: string[] = [];

  let passed = true;

  for (const { repository, number } of locations) {
    const check = await checkIssue(
      {
        repository,
        client,
        protocol,
      },
      number,
      audience,
      {
        root,
      },
    );

    lines.push(...formatIssueCheck(number, check));

    passed &&= check.findings.length === 0;
  }

  return { lines, passed };
}

function locatePublished(
  stem: string,
  context: Pick<DraftsContext, "repository" | "registry">,
) {
  const parsed = parseStem(stem);

  if (parsed?.kind !== "issue") {
    return `${stem}: no draft at ${locateDraft(stem)}`;
  }

  try {
    return {
      repository: resolveStem(parsed, context).repository,
      number: parsed.number,
    };
  } catch (error) {
    return `${stem}: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function checkIssues(
  config: LoadedConfig,
  stems: readonly string[],
  audience: IssueAudience,
): Promise<IssuesCheck> {
  const { repositories } = await config.resolve("github");

  const [repository, registry] = await Promise.all([
    resolveRepository({ root: config.context.root, repositories }),
    repositories(),
  ]);

  const drafts = new Map<string, Draft>();
  const published: IssueLocation[] = [];
  const lines: string[] = [];

  for (const stem of stems) {
    const draft = await readDraft(config.context.filesystem, locateDraft(stem));

    const location = draft === undefined
      ? locatePublished(stem, { repository, registry })
      : undefined;

    if (draft !== undefined) {
      drafts.set(stem, draft);
    } else if (isString(location)) {
      lines.push(location);
    } else if (location !== undefined) {
      published.push(location);
    }
  }

  let passed = lines.length === 0;

  if (drafts.size > 0) {
    const context = await resolveDraftsContext(config);

    for (const [stem, found] of checkDrafts(drafts, context)) {
      lines.push(
        ...(found.length === 0
          ? [`${stem}: ready`]
          : found.map(({ message }) => `${stem}: ${message}`)),
      );

      passed &&= found.length === 0;
    }
  }

  if (published.length > 0) {
    const check = await checkPublished(config, published, audience);

    lines.push(...check.lines);

    passed &&= check.passed;
  }

  return { lines, passed };
}
