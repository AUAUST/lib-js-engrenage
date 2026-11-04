import { readFileSync } from "node:fs";

import { resolveDataFile } from "#foundation/data/operations/resolveDataFile";
import { codexFile, codexTemplate } from "#tools/agents/codex/constants";
import { syncCodexFiles } from "#tools/agents/codex/setup/syncCodexFiles";
import { agentsFile } from "#tools/agents/constants";
import type { Step } from "#project/steps/types/Step";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function createCodexStep(): Step<{
  agents: ResolvedAgents;
  resolve(...paths: string[]): string;
}> {
  return {
    name: codexFile,
    message: `Create ${codexFile} with Codex instructions and a rule mapping?`,
    isMissing({ get, filesystem }) {
      return (
        get("agents").preferred?.includes("codex") === true &&
        filesystem.exists(agentsFile) &&
        !filesystem.exists(codexFile)
      );
    },
    plan({ get, filesystem }) {
      filesystem.write(
        codexFile,
        readFileSync(resolveDataFile(codexTemplate), "utf-8"),
      );

      syncCodexFiles({
        filesystem,
        resolve: get("resolve"),
        agents: get("agents"),
      });
    },
  };
}
