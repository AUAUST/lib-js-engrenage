import { readFile } from "node:fs/promises";

import { resolveDataFile } from "#foundation/data/index";
import {
  agentsFile,
  agentsTemplate,
  endMarker,
} from "#metalbrain/instructions/constants";
import {
  formatReferenceMarker,
  getInstructionTemplates,
} from "#metalbrain/instructions/index";
import { syncAgentFiles } from "#tools/metalbrain/setup/syncAgentFiles";
import type { Step } from "#project/steps/index";

export function createAgentsStep(): Step {
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
        .map(({ reference }) => {
          return formatReferenceMarker(reference);
        })
        .join("\n");

      const text = await readFile(template, "utf-8");

      const body = text.trimEnd();

      await filesystem.write(
        agentsFile,
        references === ""
          ? `${body}\n`
          : `${body}\n\n${references}\n${endMarker}\n`,
      );

      await syncAgentFiles(context);
    },
  };
}
