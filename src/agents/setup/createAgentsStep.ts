import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { agentsFile, agentsTemplate } from "#agents/constants";
import { syncAgentFiles } from "#agents/setup/syncAgentFiles";
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

      filesystem.write(agentsFile, readFileSync(template, "utf-8"));
      syncAgentFiles(config);
    },
  };
}
