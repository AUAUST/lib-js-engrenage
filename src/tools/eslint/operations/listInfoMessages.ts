import { loadEslint } from "#tools/eslint/operations/loadEslint";
import { loadInfoRules } from "#tools/eslint/operations/loadInfoRules";
import type { LoadedConfig } from "#project/config/index";
import type { InfoMessage } from "#tools/eslint/types/InfoMessage";
import type { File } from "#types/File";

export async function listInfoMessages(
  config: LoadedConfig,
  file: File,
): Promise<InfoMessage[]> {
  const createLinter = await loadEslint(config);

  // @debt the ESLint config loads twice, once in `loadInfoRules` and once in the `ESLint` instance; the instance's `calculateConfigForFile` could supply the info rules
  const infoRules = new Set(await loadInfoRules(config.context.root));

  const results = await createLinter({
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
