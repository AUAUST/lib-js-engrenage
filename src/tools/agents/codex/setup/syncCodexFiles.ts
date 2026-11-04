import {
  codexEditHook,
  codexEditHookCommand,
  codexHooksFile,
} from "#agents/codex/constants";
import { syncCodexInstructions } from "#agents/codex/setup/syncCodexInstructions";
import { syncEditHook } from "#agents/utils/syncEditHook";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

export function syncCodexFiles(
  config: ResolvedConfig,
  { hooks = false }: { hooks?: boolean } = {},
) {
  if (config.agents.preferred?.includes("codex") !== true) {
    return;
  }

  syncCodexInstructions(config);

  const configured = config.agents.codexHooks;

  if (
    configured !== false &&
    (configured === true || hooks || config.filesystem.exists(codexHooksFile))
  ) {
    syncEditHook(config, {
      file: codexHooksFile,
      matcher: codexEditHook.matcher,
      command: codexEditHookCommand,
    });
  }
}
