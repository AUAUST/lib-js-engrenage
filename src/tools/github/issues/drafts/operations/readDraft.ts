import { parseDocument } from "yaml";

import type { Filesystem } from "#foundation/filesystem/index";
import type { Draft } from "#tools/github/issues/drafts/types/Draft";
import type { File } from "#types/File";

// @debt a third frontmatter splitter beside `parseInstruction` in the agents domain and `readGithubBody` in the contract domain, instead of one shared frontmatter parser
const frontmatterPattern = /^---\r?\n((?:.*\r?\n)*?)---[ \t]*(?:\r?\n|$)/;

export async function readDraft(
  filesystem: Filesystem,
  file: File,
): Promise<Draft | undefined> {
  const content = await filesystem.read(file);

  if (content === undefined) {
    return;
  }

  const match = frontmatterPattern.exec(content);

  const manifest = parseDocument(match?.[1] ?? "");

  const [error] = manifest.errors;

  if (error !== undefined) {
    throw new Error(`Invalid manifest in ${file}: ${error.message}`, {
      cause: error,
    });
  }

  return {
    manifest,
    body: content.slice(match?.[0].length ?? 0).trim(),
  };
}
