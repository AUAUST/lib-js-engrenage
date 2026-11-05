import { spawnProcess } from "#foundation/processes/index";
import type { Directory } from "#types/Directory";

export async function runGit(
  root: Directory,
  args: readonly string[],
  env?: Record<string, string>,
): Promise<string> {
  const { status, stdout, stderr, error } = await spawnProcess("git", args, {
    cwd: root,
    env: env === undefined ? undefined : { ...process.env, ...env },
  });

  if (error !== undefined) {
    throw new Error("Cannot run git", { cause: error });
  }

  if (status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${stderr.trim()}`);
  }

  return stdout;
}
