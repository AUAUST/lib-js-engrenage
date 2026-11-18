import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";
import {
  formatGateEntry,
  runGate,
  runMessageGate,
} from "#workflows/gate/index";

export default async function ({
  worktree,
  everyone,
  message,
}: {
  worktree?: true | undefined;
  everyone?: true | undefined;
  message?: string | undefined;
}): Promise<void> {
  const audience = everyone === true ? "everyone" : "agents";

  const { failures, warnings } = message === undefined
    ? await runGate(
        await loadValidatedConfig(undefined, {
          reporter: getRunContext().reporter,
        }),
        {
          mode: worktree === true ? "worktree" : "staged",
          audience,
        },
      )
    : await runMessageGate(message, audience);

  for (const warning of warnings) {
    getRunContext().reporter.warn(formatGateEntry(warning));
  }

  for (const failure of failures) {
    getRunContext().reporter.error(formatGateEntry(failure));
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}
