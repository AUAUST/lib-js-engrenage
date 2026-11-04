import { readFileSync } from "node:fs";

import { agentsFile, agentsTemplate } from "#agents/constants";
import { syncAgentFiles } from "#agents/setup/syncAgentFiles";
import { getInstructionTemplates } from "#agents/utils/getInstructionTemplates";
import { resolveDataFile } from "#data/operations/resolveDataFile";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

export function createAgentsStep(): Step {
  return {
    name: agentsFile,
    message: `Create ${agentsFile} with the shared agent instructions?`,
    isMissing({ filesystem, getAgents }) {
      return (getAgents()?.length ?? 0) > 0 && !filesystem.exists(agentsFile);
    },
    plan({ filesystem, config }) {
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

      syncAgentFiles(config);
    },
  };
}
