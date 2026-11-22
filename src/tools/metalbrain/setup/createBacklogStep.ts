import { engrenage } from "#constants";
import { backlogIndex } from "#metalbrain/backlog/constants";
import { endMarker, metalbrain } from "#metalbrain/instructions/constants";
import {
  formatBacklogIndex,
  formatReferenceMarker,
} from "#metalbrain/instructions/index";
import {
  agentsFile,
  scratchpadFile,
  scratchpadPlaceholder,
} from "#tools/agents/constants";
import {
  addAgentRules,
  addAgentSkills,
  createFragmentRenderer,
  getAgentRuntimes,
  getMissingRuleTemplates,
  getSkillTemplates,
  listActiveExtensions,
} from "#tools/agents/index";
import { hookRoots } from "#tools/metalbrain/constants";
import { syncAgentFiles } from "#tools/metalbrain/setup/syncAgentFiles";
import type { Step } from "#project/steps/index";

const sectionReference = `${engrenage}/${metalbrain}/sections/backlog.md`;
const skills = ["analysis", "curation"];

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

      const renderer = await createFragmentRenderer(context);

      const extensions = await listActiveExtensions(context);

      const runtimes = await getAgentRuntimes(context);

      const [missingRules, skillTemplates] = await Promise.all([
        getMissingRuleTemplates({
          filesystem,
          extensions,
          renderer,
        }),
        getSkillTemplates({
          agents,
          extensions,
          renderer,
          runtimes,
          roots: hookRoots,
        }),
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

      if (!(await filesystem.exists(backlogIndex))) {
        await filesystem.write(backlogIndex, formatBacklogIndex("# Backlog"));
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

      await addAgentRules(context, ["backlog"]);

      await addAgentSkills(context, skills, hookRoots);

      await syncAgentFiles(context);
    },
  };
}
