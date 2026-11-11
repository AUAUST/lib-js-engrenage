import {
  readGithubSnapshot,
  resolveRepository,
} from "#tools/github/issues/api/index";
import type { LoadedConfig } from "#project/config/index";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export async function resolveDraftsContext(
  config: LoadedConfig,
): Promise<DraftsContext> {
  const [
    { protocol, repositories },
    snapshot,
  ] = await Promise.all([config.resolve("github"), readGithubSnapshot(config)]);

  if (snapshot === undefined) {
    throw new Error(
      "Drafts need the GitHub snapshot: run `engrenage github fetch`",
    );
  }

  const [repository, registry] = await Promise.all([
    resolveRepository({ root: config.context.root, repositories }),
    repositories(),
  ]);

  return {
    snapshot,
    protocol,
    repository,
    registry,
  };
}
