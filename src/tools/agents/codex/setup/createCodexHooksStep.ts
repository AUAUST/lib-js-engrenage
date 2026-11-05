import { codexFile, codexHooksFile } from "#tools/agents/codex/constants";
import { syncCodexFiles } from "#tools/agents/codex/setup/syncCodexFiles";
import type { Step } from "#project/steps/index";
import type { AgentSections } from "#tools/agents/types/AgentSections";

export function createCodexHooksStep(): Step<AgentSections> {
  return {
    name: codexHooksFile,
    message: "Fix, format and lint the files Codex edits with apply_patch?",
    async isMissing({ get, filesystem }) {
      const agents = await get("agents");

      return (
        agents.preferred?.includes("codex") === true &&
        agents.codexHooks !== false &&
        (await filesystem.exists(codexFile)) &&
        !(await filesystem.exists(codexHooksFile))
      );
    },
    async plan(context) {
      await syncCodexFiles(context, {
        hooks: true,
      });

      console.info(
        "Review and trust the project hooks in Codex with /hooks before using them.",
      );
    },
  };
}
