import { relative } from "node:path";

import { eslint } from "#constants";
import { pluginName } from "#tools/eslint/constants";
import { createRuleName } from "#tools/eslint/utils/createRuleName";
import type { LoadedConfig } from "#project/config/index";
import type { DebtMarker } from "#tools/eslint/types/DebtMarker";

function compareMarkers(a: DebtMarker, b: DebtMarker): number {
  if (a.file === b.file) {
    return a.line - b.line;
  }

  return a.file < b.file ? -1 : 1;
}

export async function listDebtMarkers({
  resolve,
  context,
}: LoadedConfig): Promise<DebtMarker[]> {
  const environment = await resolve("environment");

  if (!environment.hasDependency(eslint)) {
    throw new Error(
      `Listing debt markers requires the ${eslint} dependency. Install it, then retry.`,
    );
  }

  const { ESLint } = await import("eslint");

  const root = context.root;

  const ruleId = `${pluginName}/${createRuleName("debtMarkers")}`;

  const results = await new ESLint({
    cwd: root,
    cache: false,
    ruleFilter: (rule) => rule.ruleId === ruleId,
    overrideConfig: {
      languageOptions: {
        parserOptions: { projectService: false, project: null },
      },
      rules: {
        [ruleId]: ["warn", { list: true }],
      },
    },
  }).lintFiles(".");

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
