import { array, looseObject, optional, string } from "valibot";
import { parse } from "yaml";

import { splitFrontmatter } from "#foundation/markdown/index";
import { validate } from "#foundation/options/index";
import type { File } from "#types/File";

const metadataSchema = looseObject({
  paths: optional(array(string())),
});

export function parseInstruction(content: string, file: File) {
  const split = splitFrontmatter(content);

  if (split.kind === "none") {
    return {
      body: content,
      frontmatter: "",
      yaml: "",
      metadata: {},
      paths: undefined,
    };
  }

  if (split.kind === "unclosed") {
    throw new Error(`Unclosed frontmatter in ${file}`);
  }

  const { source: frontmatter, yaml, body } = split;

  let input: unknown;

  try {
    input = parse(yaml);
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${file}`, {
      cause: error,
    });
  }

  const {
    paths,
  } = validate(metadataSchema, input ?? {}, `${file} frontmatter`);

  return {
    body: body.trimStart(),
    frontmatter,
    yaml,
    metadata: input ?? {},
    paths,
  };
}
