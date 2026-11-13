import { eslint } from "#constants";
import { loadInfoRules } from "#tools/eslint/operations/loadInfoRules";
import type { LoadedConfig } from "#project/config/index";
import type { InfoMessage } from "#tools/eslint/types/InfoMessage";
import type { File } from "#types/File";

export async function listInfoMessages(
  { resolve, context }: LoadedConfig,
  file: File,
): Promise<InfoMessage[]> {
  const environment = await resolve("environment");

  if (!environment.hasDependency(eslint)) {
    return [];
  }

  const { ESLint } = await import("eslint");

  const root = context.root;

  const infoRules = new Set(await loadInfoRules(root));

  const results = await new ESLint({
    cwd: root,
    cache: false,
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
