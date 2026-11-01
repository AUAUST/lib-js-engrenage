import { cancel, isCancel, multiselect } from "@clack/prompts";

import { empty } from "@auaust/toolkit/empty";

import { addAgentSkills } from "#agents/setup/addAgentSkills";
import { getSkillTemplates } from "#agents/utils/getSkillTemplates";
import { readConfig } from "#config/utils/readConfig";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { settleChanges } from "#support/commander/utils/settleChanges";
import type { ResolvedConfig } from "#config/index";

async function getNames(config: ResolvedConfig, name: string | undefined) {
  if (name !== undefined) {
    return [name];
  }

  const missing = getSkillTemplates(config).filter(({ files }) => {
    return files.some(({ file }) => !config.filesystem.exists(file));
  });

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
  const config = await readConfig(process.cwd());

  const names = await getNames(config, name);

  if (empty(names)) {
    return;
  }

  addAgentSkills(config, names);

  settleChanges(config, {
    check: false,
  });
}

export const skills = defineCommand((command) => {
  command
    .description("Select and install shared agent skills.")
    .action(() => add());

  command
    .command("add")
    .description("Install a shared agent skill by name.")
    .argument("<name>", "skill name, for example issue-planning")
    .action((name) => add(name));

  return command;
});
