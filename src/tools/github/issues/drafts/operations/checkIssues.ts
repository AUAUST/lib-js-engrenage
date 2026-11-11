import {
  createGithubClient,
  resolveRepository,
} from "#tools/github/issues/api/index";
import {
  checkIssue,
  formatIssueCheck,
  type IssueAudience,
} from "#tools/github/issues/contract/index";
import { readDraft } from "#tools/github/issues/drafts/operations/readDraft";
import { resolveDraftsContext } from "#tools/github/issues/drafts/operations/resolveDraftsContext";
import { checkDrafts } from "#tools/github/issues/drafts/utils/checkDrafts";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import type { LoadedConfig } from "#project/config/index";
import type { Draft } from "#tools/github/issues/drafts/types/Draft";
import type { IssuesCheck } from "#tools/github/issues/drafts/types/IssuesCheck";

async function checkPublished(
  config: LoadedConfig,
  numbers: readonly number[],
  audience: IssueAudience,
) {
  const { root } = config.context;

  const { repositories, protocol } = await config.resolve("github");

  const access = {
    repository: await resolveRepository({ root, repositories }),
    client: await createGithubClient(),
    protocol,
  };

  const lines: string[] = [];

  let passed = true;

  for (const number of numbers) {
    const check = await checkIssue(access, number, audience, { root });

    lines.push(...formatIssueCheck(number, check));

    passed &&= check.findings.length === 0;
  }

  return { lines, passed };
}

export async function checkIssues(
  config: LoadedConfig,
  stems: readonly string[],
  audience: IssueAudience,
): Promise<IssuesCheck> {
  const drafts = new Map<string, Draft>();
  const published: number[] = [];
  const lines: string[] = [];

  for (const stem of stems) {
    const file = locateDraft(stem);

    const draft = await readDraft(config.context.filesystem, file);

    if (draft !== undefined) {
      drafts.set(stem, draft);
    } else if (/^\d+$/.test(stem)) {
      published.push(Number(stem));
    } else {
      lines.push(
        stem.includes(".")
          ? `${stem}: references to registered repositories are not supported yet`
          : `${stem}: no draft at ${file}`,
      );
    }
  }

  let passed = lines.length === 0;

  if (drafts.size > 0) {
    const findings = checkDrafts(drafts, await resolveDraftsContext(config));

    for (const [stem, found] of findings) {
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
