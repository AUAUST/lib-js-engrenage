import { cancel, isCancel, multiselect } from "@clack/prompts";

import { addAgentRules } from "#tools/agents/operations/addAgentRules";
import { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { settleChanges } from "#workflows/cli/operations/settleChanges";
import { readConfig } from "#workflows/registry/operations/readConfig";

async function add(name?: string) {
  const config = await readConfig(process.cwd());

  let names: string[];

  if (name !== undefined) {
    names = [name];
  } else {
    const missing = getMissingRuleTemplates(config);

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

  addAgentRules(config, names);

  await settleChanges(config, {
    check: false,
  });
}

export const rules = defineCommand((command) => {
  command.action(() => add());

  command
    .command("add")
    .description("Install a shared agent rule by name.")
    .argument("<name>", "rule name, for example code-style")
    .action((name) => add(name));

  return command;
});
