import { codexFile, codexHooksFile } from "#tools/agents/codex/constants";
import { syncCodexFiles } from "#tools/agents/codex/setup/syncCodexFiles";
import type { Step } from "#project/steps/types/Step";

export function createCodexHooksStep(): Step {
  return {
    name: codexHooksFile,
    message: "Fix, format and lint the files Codex edits with apply_patch?",
    isMissing({ config, filesystem }) {
      return (
        config.agents.preferred?.includes("codex") === true &&
        config.agents.codexHooks !== false &&
        filesystem.exists(codexFile) &&
        !filesystem.exists(codexHooksFile)
      );
    },
    plan({ config }) {
      syncCodexFiles(config, {
        hooks: true,
      });

      console.info(
        "Review and trust the project hooks in Codex with /hooks before using them.",
      );
    },
  };
}
