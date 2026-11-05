import { relative } from "node:path";

import { eslint } from "#constants";
import { pluginName } from "#tools/eslint/constants";
import { createRuleName } from "#tools/eslint/utils/createRuleName";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { DebtMarker } from "#tools/eslint/types/DebtMarker";

function compareMarkers(a: DebtMarker, b: DebtMarker): number {
  if (a.file === b.file) {
    return a.line - b.line;
  }

  return a.file < b.file ? -1 : 1;
}

export async function listDebtMarkers(
  config: ProjectConfig,
): Promise<DebtMarker[]> {
  if (!config.environment.hasDependency(eslint)) {
    throw new Error(
      `Listing debt markers requires the ${eslint} dependency. Install it, then retry.`,
    );
  }

  // eslint is an optional peer dependency, so it loads only once the project is known to have it
  // eslint-disable-next-line auaust/no-dynamic-import
  const { ESLint } = await import("eslint");

  // @debt Markers are listed through the project's full ESLint config, so files are parsed with type information that comment markers never need.

  const ruleId = `${pluginName}/${createRuleName("debtMarkers")}`;

  const results = await new ESLint({
    cwd: config.root,
    cache: false,
    ruleFilter: (rule) => rule.ruleId === ruleId,
    overrideConfig: {
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
          file: relative(config.root, filePath),
          line,
          column,
          statement: message,
        });
      }
    }
  }

  return markers.toSorted(compareMarkers);
}
