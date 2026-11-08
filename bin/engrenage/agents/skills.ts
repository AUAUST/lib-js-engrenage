import { cancel, isCancel, multiselect } from "@clack/prompts";

import { empty } from "@auaust/toolkit/empty";

import { agentsSection } from "#tools/agents/index";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";
import { settleChanges } from "#workflows/sync/operations/settleChanges";
import type { LoadedConfig } from "#project/config/index";

async function getNames(config: LoadedConfig, name: string | undefined) {
  if (name !== undefined) {
    return [name];
  }

  const filesystem = config.context.filesystem;

  const agents = await config.resolve(agentsSection);

  const templates = await getSkillTemplates({ agents });

  const installed = await Promise.all(
    templates.map(async ({ files }) => {
      const exist = await Promise.all(
        files.map(({ file }) => filesystem.exists(file)),
      );

      return exist.every(Boolean);
    }),
  );

  const missing = templates.filter((_, index) => !installed[index]);

  if (missing.length === 0) {
    return void console.info(
      "All available agent skills are already installed.",
    );
  }

  if (!process.stdin.isTTY) {
    throw new Error(
      "Skill selection needs an interactive terminal; use agents skills add <name> instead.",
    );
  }

  const selected = await multiselect({
    message: "Choose missing skills to add",
    options: missing.map((template) => {
      return {
        value: template.name,
        label: template.title,
        hint: `${template.category}: ${template.description}`,
      };
    }),
    initialValues: missing
      .filter((template) => template.default)
      .map(({ name: skill }) => skill),
    required: false,
  });

  if (!isCancel(selected)) {
    return selected;
  }

  cancel("Cancelled, nothing was written.");

  process.exitCode = 130;
}

async function add(name?: string) {
  const config = await loadValidatedConfig();

  const names = await getNames(config, name);

  if (empty(names)) {
    return;
  }

  await addAgentSkills(
    {
      filesystem: config.context.filesystem,
      agents: await config.resolve(agentsSection),
    },
    names,
  );

  await settleChanges(config, {
    check: false,
  });
}

export const skills = defineLegacyCommand((command) => {
  command.action(() => add());

  command
    .command("add")
    .description("Install a shared agent skill by name.")
    .argument("<name>", "skill name, for example issue-planning")
    .action((name) => add(name));

  return command;
});
