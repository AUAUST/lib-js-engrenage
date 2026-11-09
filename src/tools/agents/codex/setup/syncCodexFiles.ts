import {
  codexHookPrefix,
  codexHooks,
  codexHooksFile,
} from "#tools/agents/codex/constants";
import { syncCodexInstructions } from "#tools/agents/codex/operations/syncCodexInstructions";
import { syncHooks } from "#tools/agents/operations/syncHooks";
import type { LoadedConfig } from "#project/config/index";

export async function syncCodexFiles(
  { resolve, context }: LoadedConfig,
  { hooks = false }: { hooks?: boolean } = {},
) {
  const config = {
    filesystem: context.filesystem,
    resolve: context.path,
    agents: await resolve("agents"),
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
    await syncHooks(config, {
      file: codexHooksFile,
      hooks: codexHooks,
      prefix: codexHookPrefix,
    });
  }
}
