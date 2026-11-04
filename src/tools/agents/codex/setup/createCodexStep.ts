import { readFileSync } from "node:fs";

import { resolveDataFile } from "#foundation/data/operations/resolveDataFile";
import { codexFile, codexTemplate } from "#tools/agents/codex/constants";
import { syncCodexFiles } from "#tools/agents/codex/setup/syncCodexFiles";
import { agentsFile } from "#tools/agents/constants";
import type { Step } from "#project/steps/types/Step";

export function createCodexStep(): Step {
  return {
    name: codexFile,
    message: `Create ${codexFile} with Codex instructions and a rule mapping?`,
    isMissing({ config, filesystem }) {
      return (
        config.agents.preferred?.includes("codex") === true &&
        filesystem.exists(agentsFile) &&
        !filesystem.exists(codexFile)
      );
    },
    plan({ config, filesystem }) {
      filesystem.write(
        codexFile,
        readFileSync(resolveDataFile(codexTemplate), "utf-8"),
      );

      syncCodexFiles(config);
    },
  };
}
