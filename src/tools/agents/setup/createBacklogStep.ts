import { engrenage } from "#constants";
import {
  agentsFile,
  backlogIndex,
  endMarker,
  metalbrain,
  scratchpadFile,
  scratchpadPlaceholder,
} from "#tools/agents/constants";
import { addAgentRules } from "#tools/agents/operations/addAgentRules";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
import { formatBacklogIndex } from "#tools/agents/utils/formatBacklogIndex";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import type { Step } from "#project/steps/index";

const sectionReference = `${engrenage}/${metalbrain}/sections/backlog.md`;
const skills = ["curation"];

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

      const extensions = await listActiveExtensions(context);

      const [missingRules, skillTemplates] = await Promise.all([
        getMissingRuleTemplates({
          filesystem,
          extensions,
          fillers,
        }),
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
          formatBacklogIndex("# Backlog", ["", "No open categories yet.", ""]),
        );
      }

      const instructions = await filesystem.read(agentsFile);

      if (instructions === undefined) {
        throw new Error(`Create ${agentsFile} before setting up the backlog`);
      }

      if (!instructions.includes(sectionReference)) {
        await filesystem.write(
          agentsFile,
          `${instructions.trimEnd()}\n\n${formatReferenceMarker(sectionReference)}\n${endMarker}\n`,
        );
      }

      if (!(await filesystem.exists(scratchpadFile))) {
        await filesystem.write(
          scratchpadFile,
          `# Scratchpad\n\n<!-- scratchpad-placeholder -->\n\n${scratchpadPlaceholder}\n`,
        );
      }

      const fillers = await createAgentFillers(context);

      await addAgentRules(
        {
          filesystem,
          agents,
          fillers,
          config: context,
        },
        ["backlog"],
      );

      await addAgentSkills(context, skills);

      await syncAgentFiles(context);
    },
  };
}
