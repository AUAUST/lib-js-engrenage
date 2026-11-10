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
  const { failures, warnings } = message === undefined
    ? await runGate(await loadValidatedConfig(), {
        mode: worktree === true ? "worktree" : "staged",
        audience: everyone === true ? "everyone" : "agents",
      })
    : await runMessageGate(message);

  for (const warning of warnings) {
    console.warn(formatGateEntry(warning));
  }

  for (const failure of failures) {
    console.error(formatGateEntry(failure));
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}
