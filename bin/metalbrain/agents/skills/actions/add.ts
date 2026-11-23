import { cancel, isCancel, multiselect } from "@clack/prompts";

import { empty } from "@auaust/toolkit";

import { addAgentSkills, getSkillTemplates } from "#metalbrain/runtimes/index";
import { settleChanges } from "#project/sync/index";
import { loadAgentInputs } from "#tools/metalbrain/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

type AgentInputs = Awaited<ReturnType<typeof loadAgentInputs>>;

async function getNames(inputs: AgentInputs, name: string | undefined) {
  if (name !== undefined) {
    return [name];
  }

  const { filesystem } = inputs;

  const templates = await getSkillTemplates(inputs);

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
    return void getRunContext().reporter.log(
      "All available agent skills are already installed.",
    );
  }

  if (!process.stdin.isTTY) {
    throw new Error(
      "Skill selection needs an interactive terminal; use metalbrain agents skills add <name> instead.",
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

export default async function (name?: string): Promise<void> {
  const config = await loadValidatedConfig(undefined, {
    reporter: getRunContext().reporter,
  });

  const inputs = await loadAgentInputs(config);

  const names = await getNames(inputs, name);

  if (empty(names)) {
    return;
  }

  await addAgentSkills(inputs, names);

  await settleChanges(config, {
    check: false,
  });
}
