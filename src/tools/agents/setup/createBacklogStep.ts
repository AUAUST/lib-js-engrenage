import { readFileSync } from "node:fs";

import { random } from "@auaust/primitive-kit/arrays";

import { engrenage } from "#constants";
import { resolveDataFile } from "#foundation/data/index";
import {
  agentsFile,
  backlogIndex,
  backlogTemplate,
  scratchpadFile,
  scratchpadPlaceholders,
} from "#tools/agents/constants";
import { addAgentRules } from "#tools/agents/operations/addAgentRules";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
import type { Step } from "#project/steps/index";
import type { AgentSections } from "#tools/agents/types/AgentSections";

const sectionReference = `${engrenage}/agents/sections/backlog.md`;
const skills = ["scratchpad", "backlog-handling", "debt-harvesting"];

export function createBacklogStep(): Step<AgentSections> {
  return {
    name: "shared backlog",
    message:
      "Set up the shared backlog in .ai/backlog/ and scratchpad in .ai/scratchpad.md?",
    async isMissing({ get, filesystem, getAgents }) {
      if ((getAgents()?.length ?? 0) === 0 || !filesystem.exists(agentsFile)) {
        return false;
      }

      return (
        !filesystem.exists(backlogIndex) ||
        !filesystem.exists(scratchpadFile) ||
        !(filesystem.read(agentsFile)?.includes(sectionReference) ?? false) ||
        getMissingRuleTemplates({ filesystem }).some(({ name }) => {
          return name === "backlog";
        }) ||
        getSkillTemplates({ agents: await get("agents") }).some(
          ({ name, files }) => {
            return (
              skills.includes(name) &&
              files.some(({ file }) => !filesystem.exists(file))
            );
          },
        )
      );
    },
    async plan(context) {
      const { filesystem, get } = context;
      const agents = await get("agents");

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

      addAgentRules({ filesystem, agents }, ["backlog"]);
      addAgentSkills({ filesystem, agents }, skills);

      await syncAgentFiles(context);
    },
  };
}
