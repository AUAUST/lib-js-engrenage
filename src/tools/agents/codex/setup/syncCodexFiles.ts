import {
  codexEditHook,
  codexEditHookCommand,
  codexHooksFile,
} from "#tools/agents/codex/constants";
import { syncCodexInstructions } from "#tools/agents/codex/operations/syncCodexInstructions";
import { syncEditHook } from "#tools/agents/operations/syncEditHook";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";

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
