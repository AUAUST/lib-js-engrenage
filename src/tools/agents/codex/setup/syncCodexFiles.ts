import {
  codexEditHook,
  codexGithubHook,
  codexHooksFile,
} from "#tools/agents/codex/constants";
import { syncCodexInstructions } from "#tools/agents/codex/operations/syncCodexInstructions";
import { agentsSection } from "#tools/agents/operations/agentsSection";
import { syncHook } from "#tools/agents/operations/syncHook";
import type { LoadedConfig } from "#project/config/index";

export async function syncCodexFiles(
  { resolve, context }: LoadedConfig,
  { hooks = false }: { hooks?: boolean } = {},
) {
  const config = {
    filesystem: context.filesystem,
    resolve: context.path,
    agents: await resolve(agentsSection),
  };

  if (config.agents.preferred?.includes("codex") !== true) {
    return;
  }

  await syncCodexInstructions(config);

  const configured = config.agents.codexHooks;

  if (
    configured !== false &&
    (configured === true ||
      hooks ||
      (await config.filesystem.exists(codexHooksFile)))
  ) {
    for (const hook of [codexEditHook, codexGithubHook]) {
      await syncHook(config, {
        file: codexHooksFile,
        hook,
      });
    }
  }
}
