import { parseDocument, type YAMLError } from "yaml";

import { splitFrontmatter } from "#foundation/markdown/index";
import {
  quoteReferenceHint,
  quoteValueHint,
} from "#tools/github/issues/drafts/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Draft } from "#tools/github/issues/drafts/types/Draft";
import type { File } from "#types/File";

export async function readDraft(
  filesystem: Filesystem,
  file: File,
): Promise<Draft | undefined> {
  const content = await filesystem.read(file);

  if (content === undefined) {
    return;
  }

  const split = splitFrontmatter(content);

  const manifest = parseDocument(split.kind === "closed" ? split.yaml : "");

  const [error] = manifest.errors;

  if (error !== undefined) {
    const hint = manifestErrorHint(error);

    throw new Error(
      `Invalid manifest in ${file}: ${error.message}${hint === undefined ? "" : `\n${hint}`}`,
      {
        cause: error,
      },
    );
  }

  return {
    manifest,
    body: split.body.trim(),
  };
}

function manifestErrorHint(error: YAMLError): string | undefined {
  if (error.code === "BAD_SCALAR_START") {
    return quoteValueHint;
  }

  // @debt Detects the comment-separation error by `yaml`'s message wording, which a `yaml` release may change.
  if (error.code === "MISSING_CHAR" && error.message.startsWith("Comments")) {
    return quoteReferenceHint;
  }
}
