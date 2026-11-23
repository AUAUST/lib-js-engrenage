import { engrenage } from "#constants";
import {
  backlog,
  backlogRecordIndex,
  scratchpadFile,
  scratchpadPlaceholder,
} from "#metalbrain/backlog/constants";
import {
  agentsFile,
  endMarker,
  metalbrain,
} from "#metalbrain/instructions/constants";
import {
  addAgentRules,
  formatReferenceMarker,
  getMissingRuleTemplates,
} from "#metalbrain/instructions/index";
import { writeRecordIndex } from "#metalbrain/records/index";
import { addAgentSkills, getSkillTemplates } from "#metalbrain/runtimes/index";
import { loadAgentInputs } from "#tools/metalbrain/operations/loadAgentInputs";
import { syncAgentFiles } from "#tools/metalbrain/setup/syncAgentFiles";
import type { Step } from "#project/steps/index";

const sectionReference = `${engrenage}/${metalbrain}/sections/backlog.md`;
const skills = ["analysis", "curation"];

export function createBacklogStep(): Step {
  return {
    name: "shared backlog",
    message: "Set up the shared backlog in .ai/backlog/ and scratchpad in .ai/scratchpad.md?",
    async isMissing(context) {
      const { filesystem, getAgents } = context;

      if (
        (getAgents()?.length ?? 0) === 0 ||
        !(await filesystem.exists(agentsFile))
      ) {
        return false;
      }

      const instructions = await filesystem.read(agentsFile);

      if (
        !(await filesystem.exists(backlogRecordIndex)) ||
        !(await filesystem.exists(scratchpadFile)) ||
        !(instructions?.includes(sectionReference) ?? false)
      ) {
        return true;
      }

      const inputs = await loadAgentInputs(context);

      const [missingRules, skillTemplates] = await Promise.all([
        getMissingRuleTemplates(inputs),
        getSkillTemplates(inputs),
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
      const { filesystem } = context;

      if (!(await filesystem.exists(backlogRecordIndex))) {
        await writeRecordIndex(filesystem, backlog);
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

      const inputs = await loadAgentInputs(context);

      await addAgentRules(inputs, ["backlog"]);

      await addAgentSkills(inputs, skills);

      await syncAgentFiles(context);
    },
  };
}
