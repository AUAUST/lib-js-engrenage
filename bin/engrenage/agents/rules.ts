import { cancel, isCancel, multiselect } from "@clack/prompts";

import { agentsSection } from "#tools/agents/index";
import { addAgentRules } from "#tools/agents/operations/addAgentRules";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { settleChanges } from "#workflows/cli/operations/settleChanges";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";

async function add(name?: string) {
  const config = await loadValidatedConfig();

  let names: string[];

  if (name !== undefined) {
    names = [name];
  } else {
    const missing = await getMissingRuleTemplates({
      filesystem: config.context.filesystem,
    });

    if (missing.length === 0) {
      return void console.info(
        "All available agent rules are already installed.",
      );
    }

    if (!process.stdin.isTTY) {
      throw new Error(
        "Rule selection needs an interactive terminal; use agents rules add <name> instead.",
      );
    }

    const selected = await multiselect({
      message: "Choose missing rules to add",
      options: missing.map((template) => {
        return {
          value: template.name,
          label: template.title,
          hint: `${template.category}: ${template.description} (${template.paths?.join(", ") ?? "All files"})`,
        };
      }),
      initialValues: missing
        .filter((template) => template.default)
        .map(({ name: rule }) => rule),
      required: false,
    });

    if (isCancel(selected)) {
      cancel("Cancelled, nothing was written.");
      process.exitCode = 130;

      return;
    }

    names = selected;
  }

  if (names.length === 0) {
    return;
  }

  await addAgentRules(
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

export const rules = defineLegacyCommand((command) => {
  command.action(() => add());

  command
    .command("add")
    .description("Install a shared agent rule by name.")
    .argument("<name>", "rule name, for example code-style")
    .action((name) => add(name));

  return command;
});
