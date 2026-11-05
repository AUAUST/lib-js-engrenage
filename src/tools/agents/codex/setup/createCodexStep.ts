import { readFile } from "node:fs/promises";

import { resolveDataFile } from "#foundation/data/index";
import { codexFile, codexTemplate } from "#tools/agents/codex/constants";
import { syncCodexFiles } from "#tools/agents/codex/setup/syncCodexFiles";
import { agentsFile } from "#tools/agents/constants";
import type { Step } from "#project/steps/index";
import type { AgentSections } from "#tools/agents/types/AgentSections";

export function createCodexStep(): Step<AgentSections> {
  return {
    name: codexFile,
    message: `Create ${codexFile} with Codex instructions and a rule mapping?`,
    async isMissing({ get, filesystem }) {
      const agents = await get("agents");

      return (
        agents.preferred?.includes("codex") === true &&
        (await filesystem.exists(agentsFile)) &&
        !(await filesystem.exists(codexFile))
      );
    },
    async plan(context) {
      const { filesystem } = context;

      await filesystem.write(
        codexFile,
        await readFile(resolveDataFile(codexTemplate), "utf-8"),
      );

      await syncCodexFiles(context);
    },
  };
}
