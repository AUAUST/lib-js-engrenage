import { iterable } from "@auaust/toolkit";

import { resolveWithin } from "#foundation/filesystem/index";
import { formatBudgetFinding, measureEditedFile } from "#tools/agents/index";
import type { LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";
import type { GateWarning } from "#workflows/gate/types/GateWarning";

// @debt in staged mode the entries are read from the worktree, not from the index the commit records.
export async function measureEntries(
  config: LoadedConfig,
  files: Files,
): Promise<GateWarning[]> {
  const { root } = config.context;

  const { budgets } = await config.resolve("agents");

  const findings = await Promise.all(
    files.map((file) => {
      return measureEditedFile(root, resolveWithin(root, file), budgets);
    }),
  );

  const flattened = findings.flat();

  return flattened.length === 0
    ? []
    : [
        {
          step: "budgets",
          output: iterable.join(
            iterable.map(flattened, formatBudgetFinding),
            "\n",
          ),
        },
      ];
}
