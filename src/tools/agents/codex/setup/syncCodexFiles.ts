import {
  codexEditHook,
  codexEditHookCommand,
  codexHooksFile,
} from "#tools/agents/codex/constants";
import { syncCodexInstructions } from "#tools/agents/codex/operations/syncCodexInstructions";
import { syncEditHook } from "#tools/agents/operations/syncEditHook";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function syncCodexFiles(
  config: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
    agents: ResolvedAgents;
  },
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
