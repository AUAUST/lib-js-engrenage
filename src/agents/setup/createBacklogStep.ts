import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { random } from "@auaust/primitive-kit/arrays";

import {
  agentsFile,
  backlogIndex,
  backlogTemplate,
  scratchpadFile,
  scratchpadPlaceholders,
} from "#agents/constants";
import { addAgentRules } from "#agents/setup/addAgentRules";
import { addAgentSkills } from "#agents/setup/addAgentSkills";
import { syncAgentFiles } from "#agents/setup/syncAgentFiles";
import { getMissingRuleTemplates } from "#agents/utils/getMissingRuleTemplates";
import { getSkillTemplates } from "#agents/utils/getSkillTemplates";
import { engrenage } from "#constants";
import type { Step } from "#support/scaffold/types/Step";

const sectionReference = `${engrenage}/agents/sections/backlog.md`;
const skills = ["scratchpad", "backlog-handling", "debt-harvesting"];

export function createBacklogStep(): Step {
  return {
    name: "shared backlog",
    message:
      "Set up the shared backlog in .ai/backlog/ and scratchpad in .ai/scratchpad.md?",
    isMissing({ config, filesystem, getAgents }) {
      if ((getAgents()?.length ?? 0) === 0 || !filesystem.exists(agentsFile)) {
        return false;
      }

      return (
        !filesystem.exists(backlogIndex) ||
        !filesystem.exists(scratchpadFile) ||
        !(filesystem.read(agentsFile)?.includes(sectionReference) ?? false) ||
        getMissingRuleTemplates(config).some(({ name }) => {
          return name === "backlog";
        }) ||
        getSkillTemplates(config).some(({ name, files }) => {
          return (
            skills.includes(name) &&
            files.some(({ file }) => !filesystem.exists(file))
          );
        })
      );
    },
    plan({ config, filesystem }) {
      if (!filesystem.exists(backlogIndex)) {
        // @debt engrenage's own data files are located with createRequire(import.meta.url).resolve in several places (createCodexStep, createAgentsStep, getInstructionTemplates, renderWorkflow, resolveTsconfigPresets); one helper could own it
        filesystem.write(
          backlogIndex,
          readFileSync(
            createRequire(import.meta.url).resolve(backlogTemplate),
            "utf-8",
          ),
        );
      }

      const instructions = filesystem.read(agentsFile);

      if (instructions === undefined) {
        throw new Error(`Create ${agentsFile} before setting up the backlog`);
      }

      // @debt the "<!-- @reference … -->" syntax is hand-written here, in createAgentsStep and createInstructionFile, and re-parsed by a regex in getMissingRuleTemplates, although markdownBlocks already describes it
      if (!instructions.includes(sectionReference)) {
        filesystem.write(
          agentsFile,
          `${instructions.trimEnd()}\n\n<!-- @reference ${sectionReference} -->\n<!-- @end -->\n`,
        );
      }

      if (!filesystem.exists(scratchpadFile)) {
        filesystem.write(
          scratchpadFile,
          `# Scratchpad\n\n<!-- scratchpad-placeholder -->\n\n${random(scratchpadPlaceholders)}\n`,
        );
      }

      addAgentRules(config, ["backlog"]);
      addAgentSkills(config, skills);

      syncAgentFiles(config);
    },
  };
}
