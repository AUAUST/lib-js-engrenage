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

function toClaimedIssue(stem: string, context: DraftsContext) {
  const parsed = parseStem(stem);

  if (parsed?.kind !== "issue") {
    throw new Error(`${stem}: claim takes the numbers of published issues`);
  }

  const resolved = resolveStem(parsed, context);

  return { ...resolved, number: parsed.number };
}

export async function claimIssues(
  config: LoadedConfig,
  stems: readonly string[],
): Promise<readonly string[]> {
  const { filesystem } = config.context;

  const context = await resolveDraftsContext(config);

  const claimed = stems.map((stem) => toClaimedIssue(stem, context));

  for (const { stem } of claimed) {
    if (await filesystem.exists(locateDraft(stem))) {
      throw new Error(
        `${locateDraft(stem)} exists: publish or delete it before claiming ${stem} again`,
      );
    }
  }

  const client = await createGithubClient();

  const drafting = context.protocol.options.drafting;

  for (const { repository, stem, number } of claimed) {
    const access: IssueAccess = {
      repository,
      client,
      protocol: context.protocol,
    };

    const target = resolveManifestTarget(context.snapshot, repository);

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
      locateFetchedIssue(stem),
      renderDraft(new Document(manifest), issue.body),
    );

    await filesystem.write(
      locateDraft(stem),
      renderDraft(
        new Document(manifest),
        toDraftBody(issue.body, repository, context, contract),
        listManifestOptions(target.labels, fields),
      ),
    );

    if (
      repository === context.repository &&
      !issue.blockers.includes(drafting)
    ) {
      await writeFieldValue(
        access,
        number,
        findBlockersField(target, context.protocol),
        issue.blockers,
        [...issue.blockers, drafting],
      );
    }

    await formatChanges(config);

    await filesystem.flush();
  }

  return claimed.map(({ stem }) => stem);
}
