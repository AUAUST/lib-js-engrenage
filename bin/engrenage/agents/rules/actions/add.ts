import { cancel, isCancel, multiselect } from "@clack/prompts";

import { addAgentRules, getMissingRuleTemplates } from "#tools/agents/index";
import { loadValidatedConfig } from "#workflows/config/index";
import { settleChanges } from "#workflows/sync/index";

export default async function (name?: string): Promise<void> {
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
      agents: await config.resolve("agents"),
    },
    names,
  );

  await settleChanges(config, {
    check: false,
  });
}
