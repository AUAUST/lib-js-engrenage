import { readFileSync } from "node:fs";

import { resolveDataFile } from "#foundation/data/operations/resolveDataFile";
import { agentsFile, agentsTemplate } from "#tools/agents/constants";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
import type { Step } from "#project/steps/types/Step";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function createAgentsStep(): Step<{
  agents: ResolvedAgents;
  resolve(...paths: string[]): string;
}> {
  return {
    name: agentsFile,
    message: `Create ${agentsFile} with the shared agent instructions?`,
    isMissing({ filesystem, getAgents }) {
      return (getAgents()?.length ?? 0) > 0 && !filesystem.exists(agentsFile);
    },
    plan({ filesystem, get }) {
      const template = resolveDataFile(agentsTemplate);

      const sections = getInstructionTemplates("sections").filter(
        (section) => section.default,
      );

      const references = sections
        .map(({ reference }) => `<!-- @reference ${reference} -->`)
        .join("\n");

      const body = readFileSync(template, "utf-8").trimEnd();

      filesystem.write(
        agentsFile,
        references === ""
          ? `${body}\n`
          : `${body}\n\n${references}\n<!-- @end -->\n`,
      );

      syncAgentFiles({
        filesystem,
        resolve: get("resolve"),
        agents: get("agents"),
      });
    },
  };
}
