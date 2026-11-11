import { isAbsolute, resolve } from "node:path";

import { readTextFile } from "#foundation/filesystem/index";
import type { GithubBodySource } from "#tools/github/issues/contract/types/GithubBodySource";
import type { Directory } from "#types/Directory";

export async function readGithubBody(
  source: GithubBodySource,
  cwd: Directory,
): Promise<string | undefined> {
  if (source.kind === "text") {
    return source.text;
  }

  if (source.kind === "unreadable") {
    return;
  }

  return readTextFile(
    isAbsolute(source.path) ? source.path : resolve(cwd, source.path),
  );
}
