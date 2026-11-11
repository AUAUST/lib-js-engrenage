import { readFile } from "node:fs/promises";

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
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
import type { Step } from "#project/steps/index";

const sectionReference = `${engrenage}/agents/sections/backlog.md`;
const skills = ["scratchpad", "backlog-handling", "debt-harvesting"];

export function createBacklogStep(): Step {
  return {
    name: "shared backlog",
    message: "Set up the shared backlog in .ai/backlog/ and scratchpad in .ai/scratchpad.md?",
    async isMissing(context) {
      const { resolve, filesystem, getAgents } = context;

      if (
        (getAgents()?.length ?? 0) === 0 ||
        !(await filesystem.exists(agentsFile))
      ) {
        return false;
      }

      const instructions = await filesystem.read(agentsFile);

      if (
        !(await filesystem.exists(backlogIndex)) ||
        !(await filesystem.exists(scratchpadFile)) ||
        !(instructions?.includes(sectionReference) ?? false)
      ) {
        return true;
      }

      const agents = await resolve("agents");

      const fillers = await createAgentFillers(context);

      const [missingRules, skillTemplates] = await Promise.all([
        getMissingRuleTemplates({ filesystem, fillers }),
        getSkillTemplates({ agents, fillers }),
      ]);

      if (missingRules.some(({ name }) => name === "backlog")) {
        return true;
      }

      for (const { name, files } of skillTemplates) {
        if (!skills.includes(name)) {
          continue;
        }

        for (const { file } of files) {
          if (!(await filesystem.exists(file))) {
            return true;
          }
        }
      }

      return false;
    },
    async plan(context) {
      const { filesystem, resolve } = context;

      const agents = await resolve("agents");

      if (!(await filesystem.exists(backlogIndex))) {
        await filesystem.write(
          backlogIndex,
          await readFile(resolveDataFile(backlogTemplate), "utf-8"),
        );
      }

      const instructions = await filesystem.read(agentsFile);

      if (instructions === undefined) {
        throw new Error(`Create ${agentsFile} before setting up the backlog`);
      }

      // @debt the "<!-- @reference … -->" syntax is hand-written here, in createAgentsStep and createInstructionFile, and re-parsed by a regex in getMissingRuleTemplates, although markdownBlocks already describes it
      if (!instructions.includes(sectionReference)) {
        await filesystem.write(
          agentsFile,
          `${instructions.trimEnd()}\n\n<!-- @reference ${sectionReference} -->\n<!-- @end -->\n`,
        );
      }

      if (!(await filesystem.exists(scratchpadFile))) {
        await filesystem.write(
          scratchpadFile,
          `# Scratchpad\n\n<!-- scratchpad-placeholder -->\n\n${random(scratchpadPlaceholders)}\n`,
        );
      }

      const fillers = await createAgentFillers(context);

      await addAgentRules(
        {
          filesystem,
          agents,
          fillers,
        },
        ["backlog"],
      );

      await addAgentSkills(
        {
          filesystem,
          agents,
          fillers,
        },
        skills,
      );

      await syncAgentFiles(context);
    },
  };
}
