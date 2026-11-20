import {
  ensureGithubSnapshot,
  resolveCurrentRepository,
} from "#tools/github/issues/api/index";
import type { LoadedConfig } from "#project/config/index";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export async function resolveDraftsContext(
  config: LoadedConfig,
): Promise<DraftsContext> {
  const [
    { contract: contractNames, repositories },
    snapshot,
  ] = await Promise.all([
    config.resolve("github"),
    ensureGithubSnapshot(config),
  ]);

  const [repository, registry] = await Promise.all([
    resolveCurrentRepository(config.context.root),
    repositories(),
  ]);

  return {
    snapshot,
    contractNames,
    repository,
    registry,
  };
}
