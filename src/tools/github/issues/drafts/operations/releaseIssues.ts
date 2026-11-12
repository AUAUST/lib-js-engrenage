import { createGithubClient } from "#tools/github/issues/api/index";
import {
  fetchIssue,
  type IssueAccess,
} from "#tools/github/issues/contract/index";
import { resolveDraftsContext } from "#tools/github/issues/drafts/operations/resolveDraftsContext";
import { writeFieldValue } from "#tools/github/issues/drafts/operations/writeFieldValue";
import { findBlockersField } from "#tools/github/issues/drafts/utils/findBlockersField";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import { resolveManifestTarget } from "#tools/github/issues/drafts/utils/resolveManifestTarget";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import type { LoadedConfig } from "#project/config/index";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { ReleasedIssue } from "#tools/github/issues/drafts/types/ReleasedIssue";

// @debt duplicates `claimIssues`' reference resolution and draft refusal; a shared resolver would own both.
function toReleasedNumber(stem: string, context: DraftsContext) {
  const parsed = parseStem(stem);

  if (parsed?.kind !== "issue") {
    throw new Error(`${stem}: release takes the numbers of published issues`);
  }

  const { repository } = resolveStem(parsed, context);

  if (repository !== context.repository) {
    throw new Error(
      `${stem}: ${repository} is another repository, and releasing its issues stays with that repository's sessions`,
    );
  }

  return parsed.number;
}

export async function releaseIssues(
  config: LoadedConfig,
  stems: readonly string[],
): Promise<readonly ReleasedIssue[]> {
  const { filesystem } = config.context;

  const context = await resolveDraftsContext(config);

  const numbers = stems.map((stem) => toReleasedNumber(stem, context));

  for (const number of numbers) {
    if (await filesystem.exists(locateDraft(String(number)))) {
      throw new Error(
        `${locateDraft(String(number))} exists: publish or delete it before releasing #${number}`,
      );
    }
  }

  const access: IssueAccess = {
    repository: context.repository,
    client: await createGithubClient(),
    protocol: context.protocol,
  };

  const target = resolveManifestTarget(context.snapshot, context.repository);

  const blockersField = findBlockersField(target, context.protocol);

  const drafting = context.protocol.options.drafting;

  const released: ReleasedIssue[] = [];

  for (const number of numbers) {
    const issue = await fetchIssue(access, number);

    const claimed = issue.blockers.includes(drafting);

    if (claimed) {
      await writeFieldValue(
        access,
        number,
        blockersField,
        issue.blockers,
        issue.blockers.filter((blocker) => blocker !== drafting),
      );
    }

    released.push({ number, released: claimed });
  }

  return released;
}
