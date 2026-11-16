import { deriveInfoRules } from "#tools/eslint/operations/deriveInfoRules";
import { loadEslint } from "#tools/eslint/operations/loadEslint";
import { loadEslintConfigs } from "#tools/eslint/operations/loadEslintConfigs";
import type { LoadedConfig } from "#project/config/index";
import type { InfoMessage } from "#tools/eslint/types/InfoMessage";
import type { File } from "#types/File";

export async function listInfoMessages(
  config: LoadedConfig,
  file: File,
): Promise<InfoMessage[]> {
  const createLinter = await loadEslint(config);

  const configs = await loadEslintConfigs(config.context.root);

  const infoRules = new Set(deriveInfoRules(configs));

  const results = await createLinter({
    overrideConfigFile: true,
    overrideConfig: configs,
    warnIgnored: false,
    ruleFilter: ({ ruleId }) => infoRules.has(ruleId),
  }).lintFiles(file);

  const messages: InfoMessage[] = [];

  for (const result of results) {
    for (const { ruleId, line, column, message, fix } of result.messages) {
      if (ruleId != null && fix === undefined) {
        messages.push({
          line,
          column,
          ruleId,
          message,
        });
      }
    }
  }

  return messages;
}
