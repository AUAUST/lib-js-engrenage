import { readFile } from "node:fs/promises";

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
    async isMissing({ filesystem, getAgents }) {
      return (
        (getAgents()?.length ?? 0) > 0 && !(await filesystem.exists(agentsFile))
      );
    },
    async plan(context) {
      const { filesystem } = context;

      const template = resolveDataFile(agentsTemplate);

      const templates = await getInstructionTemplates("sections");

      const sections = templates.filter((section) => section.default);

      const references = sections
        .map(({ reference }) => `<!-- @reference ${reference} -->`)
        .join("\n");

      const text = await readFile(template, "utf-8");
      const body = text.trimEnd();

      await filesystem.write(
        agentsFile,
        references === ""
          ? `${body}\n`
          : `${body}\n\n${references}\n<!-- @end -->\n`,
      );

      await syncAgentFiles(context);
    },
  };
}
