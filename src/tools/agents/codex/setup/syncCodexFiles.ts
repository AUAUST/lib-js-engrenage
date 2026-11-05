import {
  codexEditHook,
  codexGithubHook,
  codexHooksFile,
} from "#tools/agents/codex/constants";
import { syncCodexInstructions } from "#tools/agents/codex/operations/syncCodexInstructions";
import { syncHook } from "#tools/agents/operations/syncHook";
import type { OptionContext } from "#foundation/options/index";
import type { AgentSections } from "#tools/agents/types/AgentSections";

export async function syncCodexFiles(
  { get }: OptionContext<AgentSections>,
  { hooks = false }: { hooks?: boolean } = {},
) {
  const config = {
    filesystem: await get("filesystem"),
    resolve: await get("resolve"),
    agents: await get("agents"),
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
