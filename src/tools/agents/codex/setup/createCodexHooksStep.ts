import { codexFile, codexHooksFile } from "#tools/agents/codex/constants";
import { syncCodexFiles } from "#tools/agents/codex/setup/syncCodexFiles";
import { agentsSection } from "#tools/agents/config/sections/agentsSection";
import type { Step } from "#project/steps/index";

export function createCodexHooksStep(): Step {
  return {
    name: codexHooksFile,
    message: "Add the hooks of engrenage to Codex?",
    async isMissing({ resolve, filesystem }) {
      const agents = await resolve(agentsSection);

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
