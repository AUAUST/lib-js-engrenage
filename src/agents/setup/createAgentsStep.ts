import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { agentsFile, agentsTemplate } from "#agents/constants";
import type { Step } from "#support/scaffold/types/Step";

export function createAgentsStep(): Step {
  return {
    name: agentsFile,
    message: `Create ${agentsFile} with the shared agent instructions?`,
    isMissing({ files }) {
      return !files.exists(agentsFile);
    },
    plan({ files }) {
      const template = createRequire(import.meta.url).resolve(agentsTemplate);

      files.write(agentsFile, readFileSync(template, "utf8"));
    },
  };
}
