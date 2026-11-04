import {
  codexEditHook,
  codexGithubHook,
  codexHooksFile,
} from "#tools/agents/codex/constants";
import { syncCodexInstructions } from "#tools/agents/codex/operations/syncCodexInstructions";
import { syncHook } from "#tools/agents/operations/syncHook";
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
    for (const hook of [codexEditHook, codexGithubHook]) {
      syncHook(config, {
        file: codexHooksFile,
        hook,
      });
    }
  }
}
