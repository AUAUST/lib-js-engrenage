import { readFileSync } from "node:fs";

import { resolveDataFile } from "#foundation/data/index";
import { agentsFile, agentsTemplate } from "#tools/agents/constants";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
import type { Step } from "#project/steps/index";
import type { AgentSections } from "#tools/agents/types/AgentSections";

export function createAgentsStep(): Step<AgentSections> {
  return {
    name: agentsFile,
    message: `Create ${agentsFile} with the shared agent instructions?`,
    isMissing({ filesystem, getAgents }) {
      return (getAgents()?.length ?? 0) > 0 && !filesystem.exists(agentsFile);
    },
    async plan(context) {
      const { filesystem } = context;

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

      await syncAgentFiles(context);
    },
  };
}
