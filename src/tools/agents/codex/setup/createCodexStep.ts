import { readFileSync } from "node:fs";

import { codexFile, codexTemplate } from "#agents/codex/constants";
import { syncCodexFiles } from "#agents/codex/setup/syncCodexFiles";
import { agentsFile } from "#agents/constants";
import { resolveDataFile } from "#data/operations/resolveDataFile";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

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
