import { Document } from "yaml";

import { formatChanges } from "#project/sync/index";
import { createGithubClient } from "#tools/github/issues/api/index";
import { issueContracts } from "#tools/github/issues/contract/constants";
import {
  fetchIssue,
  findContractMeaning,
  type IssueAccess,
  type IssueContract,
} from "#tools/github/issues/contract/index";
import { resolveDraftsContext } from "#tools/github/issues/drafts/operations/resolveDraftsContext";
import { writeFieldValue } from "#tools/github/issues/drafts/operations/writeFieldValue";
import { findBlockersField } from "#tools/github/issues/drafts/utils/findBlockersField";
import { listManifestOptions } from "#tools/github/issues/drafts/utils/listManifestOptions";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import { locateFetchedIssue } from "#tools/github/issues/drafts/utils/locateFetchedIssue";
import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import { readIssueManifest } from "#tools/github/issues/drafts/utils/readIssueManifest";
import { renderDraft } from "#tools/github/issues/drafts/utils/renderDraft";
import { resolveManifestTarget } from "#tools/github/issues/drafts/utils/resolveManifestTarget";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import { toDraftBody } from "#tools/github/issues/drafts/utils/toDraftBody";
import type { LoadedConfig } from "#project/config/index";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

function toClaimedNumber(stem: string, context: DraftsContext) {
  const parsed = parseStem(stem);

  if (parsed?.kind !== "issue") {
    throw new Error(`${stem}: claim takes the numbers of published issues`);
  }

  const { repository } = resolveStem(parsed, context);

  if (repository !== context.repository) {
    throw new Error(
      `${stem}: ${repository} is another repository, and claiming and editing its issues stays with that repository's sessions`,
    );
  }

  return parsed.number;
}

export async function claimIssues(
  config: LoadedConfig,
  stems: readonly string[],
): Promise<readonly number[]> {
  const { filesystem } = config.context;

  const context = await resolveDraftsContext(config);

  const numbers = stems.map((stem) => toClaimedNumber(stem, context));

  for (const number of numbers) {
    if (await filesystem.exists(locateDraft(String(number)))) {
      throw new Error(
        `${locateDraft(String(number))} exists: publish or delete it before claiming #${number} again`,
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

  for (const number of numbers) {
    const issue = await fetchIssue(access, number);

    const fields = (
      target.types.find(({ name }) => {
        return name === issue.type;
      })?.fields ?? []
    );

    const meaning = findContractMeaning(context.protocol, issue.type);

    const contract:
      | IssueContract
      | undefined = meaning === undefined ? undefined : issueContracts[meaning];

    const manifest = readIssueManifest(issue, target, context);

    await filesystem.write(
      locateFetchedIssue(String(number)),
      renderDraft(new Document(manifest), issue.body),
    );

    await filesystem.write(
      locateDraft(String(number)),
      renderDraft(
        new Document(manifest),
        toDraftBody(issue.body, context.repository, context, contract),
        listManifestOptions(target.labels, fields),
      ),
    );

    if (!issue.blockers.includes(drafting)) {
      await writeFieldValue(access, number, blockersField, issue.blockers, [
        ...issue.blockers,
        drafting,
      ]);
    }

    await formatChanges(config);

    await filesystem.flush();
  }

  return numbers;
}
