import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { agentsFile, agentsTemplate } from "#agents/constants";
import { syncAgentFiles } from "#agents/setup/syncAgentFiles";
import { getInstructionTemplates } from "#agents/utils/getInstructionTemplates";
import type { Step } from "#support/scaffold/types/Step";

export function createAgentsStep(): Step {
  return {
    name: agentsFile,
    message: `Create ${agentsFile} with the shared agent instructions?`,
    isMissing({ filesystem, getAgents }) {
      return (getAgents()?.length ?? 0) > 0 && !filesystem.exists(agentsFile);
    },
    plan({ filesystem, config }) {
      const template = createRequire(import.meta.url).resolve(agentsTemplate);

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
