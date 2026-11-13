import { relative } from "node:path";

import { pluginName } from "#tools/eslint/constants";
import { loadEslint } from "#tools/eslint/operations/loadEslint";
import { createRuleName } from "#tools/eslint/utils/createRuleName";
import type { LoadedConfig } from "#project/config/index";
import type { DebtMarker } from "#tools/eslint/types/DebtMarker";

function compareMarkers(a: DebtMarker, b: DebtMarker): number {
  if (a.file === b.file) {
    return a.line - b.line;
  }

  return a.file < b.file ? -1 : 1;
}

export async function listDebtMarkers(
  config: LoadedConfig,
): Promise<DebtMarker[]> {
  const root = config.context.root;

  const ruleId = `${pluginName}/${createRuleName("debtMarkers")}`;

  const createLinter = await loadEslint(config);

  const linter = createLinter({
    ruleFilter: (rule) => rule.ruleId === ruleId,
    overrideConfig: {
      languageOptions: {
        parserOptions: { projectService: false, project: null },
      },
      rules: {
        [ruleId]: ["warn", { list: true }],
      },
    },
  });

  const results = await linter.lintFiles(".");

  const markers: DebtMarker[] = [];

  for (const { filePath, messages } of results) {
    for (const { ruleId: id, line, column, message } of messages) {
      if (id === ruleId) {
        markers.push({
          file: relative(root, filePath),
          line,
          column,
          statement: message,
        });
      }
    }
  }

  return markers.toSorted(compareMarkers);
}
