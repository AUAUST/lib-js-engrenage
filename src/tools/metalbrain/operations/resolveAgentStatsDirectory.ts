import { resolveHookDirectory } from "#metalbrain/runtimes/index";
import { loadValidatedConfig } from "#project/config/index";
import { resolveMainWorktree } from "#tools/git/index";
import type { Reporter } from "#foundation/reports/index";
import type { Directory } from "#types/Directory";

export async function resolveAgentStatsDirectory(
  cwd: Directory,
  reporter: Reporter,
): Promise<Directory> {
  const config = await loadValidatedConfig(
    await resolveMainWorktree(resolveHookDirectory(cwd)),
    { reporter },
  );

  const resources = await config.resolve("resources");

  return resources.path("agents.stats");
}
