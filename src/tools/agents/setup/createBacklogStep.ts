import { readFileSync } from "node:fs";

import { random } from "@auaust/primitive-kit/arrays";

import {
  agentsFile,
  backlogIndex,
  backlogTemplate,
  scratchpadFile,
  scratchpadPlaceholders,
} from "#agents/constants";
import { addAgentRules } from "#agents/operations/addAgentRules";
import { addAgentSkills } from "#agents/operations/addAgentSkills";
import { getMissingRuleTemplates } from "#agents/operations/getMissingRuleTemplates";
import { getSkillTemplates } from "#agents/operations/getSkillTemplates";
import { syncAgentFiles } from "#agents/setup/syncAgentFiles";
import { engrenage } from "#constants";
import { resolveDataFile } from "#data/operations/resolveDataFile";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

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
        filesystem.write(
          backlogIndex,
          readFileSync(resolveDataFile(backlogTemplate), "utf-8"),
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
