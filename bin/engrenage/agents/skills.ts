import { cancel, isCancel, multiselect } from "@clack/prompts";

import { empty } from "@auaust/toolkit/empty";

import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { settleChanges } from "#workflows/cli/operations/settleChanges";
import { readConfig } from "#workflows/registry/operations/readConfig";
import type { OptionContext } from "#foundation/options/index";
import type { Config } from "#workflows/registry/types/Config";

async function getNames(
  config: OptionContext<Config>,
  name: string | undefined,
) {
  if (name !== undefined) {
    return [name];
  }

  const filesystem = await config.get("filesystem");
  const agents = await config.get("agents");

  const missing = getSkillTemplates({ agents }).filter(({ files }) => {
    return files.some(({ file }) => !filesystem.exists(file));
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

  addAgentSkills(
    {
      filesystem: await config.get("filesystem"),
      agents: await config.get("agents"),
    },
    names,
  );

  await settleChanges(config, {
    check: false,
  });
}

export const skills = defineCommand((command) => {
  command.action(() => add());

  command
    .command("add")
    .description("Install a shared agent skill by name.")
    .argument("<name>", "skill name, for example issue-planning")
    .action((name) => add(name));

  return command;
});
