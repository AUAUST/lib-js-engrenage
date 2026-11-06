import { isAbsolute, resolve } from "node:path";

import { readTextFile } from "#foundation/filesystem/index";
import type { GithubBodySource } from "#tools/github/types/GithubBodySource";
import type { Directory } from "#types/Directory";

// @debt duplicates the frontmatter matching of `parseInstruction` in the agents domain instead of sharing one frontmatter parser.
const frontmatterPattern = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;

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

  const content = await readTextFile(
    isAbsolute(source.path) ? source.path : resolve(cwd, source.path),
  );

  return source.kind === "draft"
    ? content?.replace(frontmatterPattern, "").trimStart()
    : content;
}
