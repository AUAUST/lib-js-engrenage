import { cancel, isCancel, multiselect } from "@clack/prompts";

import { settleChanges } from "#project/sync/index";
import {
  addAgentRules,
  createAgentFillers,
  getMissingRuleTemplates,
  listActiveExtensions,
} from "#tools/agents/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (name?: string): Promise<void> {
  const config = await loadValidatedConfig(undefined, {
    reporter: getRunContext().reporter,
  });

  const fillers = await createAgentFillers(config);

  let names: string[];

  if (name !== undefined) {
    names = [name];
  } else {
    const missing = await getMissingRuleTemplates({
      filesystem: config.context.filesystem,
      extensions: await listActiveExtensions(config),
      fillers,
    });

    if (missing.length === 0) {
      return void getRunContext().reporter.log(
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

  await addAgentRules(config, names);

  await settleChanges(config, {
    check: false,
  });
}
