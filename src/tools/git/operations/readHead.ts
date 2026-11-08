import { spawnProcess } from "#foundation/processes/index";
import type { Directory } from "#types/Directory";

// @debt repeats `runGit`'s failure handling only to accept the exit status of an unborn HEAD
export async function readHead(root: Directory): Promise<string | undefined> {
  const args = ["rev-parse", "--verify", "--quiet", "HEAD"];

  const { status, stdout, stderr, error } = await spawnProcess("git", args, {
    cwd: root,
  });

  if (error !== undefined) {
    throw new Error("Cannot run git", { cause: error });
  }

  if (status === 1 && stdout === "") {
    return;
  }

  if (status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${stderr.trim()}`);
  }

  return stdout.trim();
}
