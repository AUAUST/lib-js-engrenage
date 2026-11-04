import { codexFile, codexHooksFile } from "#tools/agents/codex/constants";
import { syncCodexFiles } from "#tools/agents/codex/setup/syncCodexFiles";
import type { Step } from "#project/steps/types/Step";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function createCodexHooksStep(): Step<{
  agents: ResolvedAgents;
  resolve(...paths: string[]): string;
}> {
  return {
    name: codexHooksFile,
    message: "Fix, format and lint the files Codex edits with apply_patch?",
    isMissing({ get, filesystem }) {
      const agents = get("agents");

      return (
        agents.preferred?.includes("codex") === true &&
        agents.codexHooks !== false &&
        filesystem.exists(codexFile) &&
        !filesystem.exists(codexHooksFile)
      );
    },
    plan({ get, filesystem }) {
      syncCodexFiles(
        {
          filesystem,
          resolve: get("resolve"),
          agents: get("agents"),
        },
        {
          hooks: true,
        },
      );

      console.info(
        "Review and trust the project hooks in Codex with /hooks before using them.",
      );
    },
  };
}
