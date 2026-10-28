import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { codexFile, codexTemplate } from "#agents/codex/constants";
import { syncCodexFiles } from "#agents/codex/setup/syncCodexFiles";
import { agentsFile } from "#agents/constants";
import type { Step } from "#support/scaffold/types/Step";

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
        readFileSync(
          createRequire(import.meta.url).resolve(codexTemplate),
          "utf-8",
        ),
      );

      syncCodexFiles(config);
    },
  };
}
