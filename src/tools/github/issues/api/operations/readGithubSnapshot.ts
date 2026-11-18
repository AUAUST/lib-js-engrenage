import { resolveWithin } from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { githubSnapshotSchema } from "#tools/github/issues/api/config/schemas/githubSnapshotSchema";
import { githubSnapshotFile } from "#tools/github/issues/api/constants";
import type { ConfigResolver } from "#project/config/index";
import type { GithubSnapshot } from "#tools/github/issues/api/types/GithubSnapshot";

export async function readGithubSnapshot(
  config: ConfigResolver,
): Promise<GithubSnapshot | undefined> {
  const path = resolveWithin(config.context.root, githubSnapshotFile);

  const content = await config.context.filesystem.read(path);

  if (content !== undefined) {
    return validate(githubSnapshotSchema, parseJson(content, path), path);
  }
}
