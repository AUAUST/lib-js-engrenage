import { githubSnapshotFile } from "#tools/github/issues/api/constants";
import { createGithubClient } from "#tools/github/issues/api/operations/createGithubClient";
import { fetchGithubSnapshot } from "#tools/github/issues/api/operations/fetchGithubSnapshot";
import { readGithubSnapshot } from "#tools/github/issues/api/operations/readGithubSnapshot";
import type { ConfigResolver } from "#project/config/index";
import type { GithubSnapshot } from "#tools/github/issues/api/types/GithubSnapshot";

export async function ensureGithubSnapshot(
  config: ConfigResolver,
): Promise<GithubSnapshot> {
  const existing = await readGithubSnapshot(config);

  if (existing !== undefined) {
    return existing;
  }

  config.context.reporter.info(
    `No GitHub snapshot at ${githubSnapshotFile}: fetching it`,
  );

  await fetchGithubSnapshot(config, await createGithubClient());

  const fetched = await readGithubSnapshot(config);

  if (fetched === undefined) {
    throw new Error(
      `Fetching the GitHub snapshot wrote nothing at ${githubSnapshotFile}`,
    );
  }

  return fetched;
}
