import { execFileSync } from "node:child_process";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

/**
 * A temporary Git checkout of the GitHub repository `origin`, holding `files`
 * and one empty commit on `main`.
 */
export function createCheckout(
  origin: string,
  files: Record<string, string> = {},
) {
  const checkout = createTemporaryProject(files);

  function git(...args: string[]) {
    execFileSync(
      "git",
      ["-c", "user.name=Test", "-c", "user.email=test@example.com", ...args],
      {
        cwd: checkout.root,
        stdio: "ignore",
      },
    );
  }

  git("init", "--quiet", "--initial-branch=main");

  git("remote", "add", "origin", `git@github.com:${origin}.git`);

  git("commit", "--quiet", "--allow-empty", "-m", "chore: start");

  return checkout;
}
