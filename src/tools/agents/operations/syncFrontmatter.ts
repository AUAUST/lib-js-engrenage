import { isDeepStrictEqual } from "node:util";

import { isMap, isScalar, parseDocument, stringify, visit } from "yaml";

import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { keys } from "@auaust/toolkit/object";

import { preserveDirective } from "#tools/agents/constants";
import { parseInstruction } from "#tools/agents/operations/parseInstruction";
import type { GeneratedFrontmatter } from "#tools/agents/types/GeneratedFrontmatter";
import type { File } from "#types/File";

function readPreserved(comments: readonly string[]): Set<string> {
  const preserved = new Set<string>();

  for (const comment of comments) {
    for (const line of comment.split("\n")) {
      const text = line.trim();

      if (!text.startsWith(`${preserveDirective} `)) {
        continue;
      }

      for (const key of text.slice(preserveDirective.length).split(",")) {
        if (key.trim() !== "") {
          preserved.add(key.trim());
        }
      }
    }
  }

  return preserved;
}

export function syncFrontmatter(
  content: string,
  { keys: generatedKeys, values }: GeneratedFrontmatter,
  file: File,
): string {
  const { frontmatter, yaml } = parseInstruction(content, file);

  if (frontmatter === "") {
    if (keys(values).length === 0) {
      return content;
    }

    return `---\n${stringify(values)}---\n\n${content}`;
  }

  const document = parseDocument(yaml);

  if (document.errors.length > 0) {
    throw new Error(`Invalid frontmatter in ${file}`, {
      cause: document.errors[0],
    });
  }

  const comments: string[] = [];

  function collect(comment: string | null | undefined) {
    if (comment != null) {
      comments.push(comment);
    }
  }

  collect(document.commentBefore);
  collect(document.comment);

  visit(document, {
    Node(_key, node) {
      collect(node.commentBefore);
      collect(node.comment);
    },
  });

  const preserved = readPreserved(comments);
  const current: unknown = document.toJS();
  const existing = isPlainObject(current) ? current : {};

  let isChanged = false;

  for (const key of generatedKeys) {
    if (preserved.has(key)) {
      continue;
    }

    if (key in values) {
      if (
        !(key in existing) ||
        !isDeepStrictEqual(existing[key], values[key])
      ) {
        document.set(key, values[key]);
        isChanged = true;
      }
    } else if (key in existing) {
      document.delete(key);
      isChanged = true;
    }
  }

  if (!isChanged) {
    return content;
  }

  const rest = content.slice(frontmatter.length);

  if (isMap(document.contents) && document.contents.items.length === 0) {
    return rest.trimStart();
  }

  if (isScalar(document.contents)) {
    throw new Error(`Frontmatter of ${file} is not a mapping`);
  }

  return `---\n${document.toString()}---\n${rest}`;
}
