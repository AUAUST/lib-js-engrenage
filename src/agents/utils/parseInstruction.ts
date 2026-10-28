import { array, looseObject, optional, string } from "valibot";
import { parse } from "yaml";

import { validate } from "#utils/validate";
import type { File } from "#types/File";

const metadataSchema = looseObject({
  paths: optional(array(string())),
});

export function parseInstruction(content: string, file: File) {
  if (!/^---\r?\n/.test(content)) {
    return {
      body: content,
      frontmatter: "",
      metadata: {},
      paths: undefined,
    };
  }

  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);

  if (match === null) {
    throw new Error(`Unclosed frontmatter in ${file}`);
  }

  const [frontmatter, yaml = ""] = match;

  let input: unknown;

  try {
    input = parse(yaml);
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${file}`, {
      cause: error,
    });
  }

  const { paths } = validate(
    metadataSchema,
    input ?? {},
    `${file} frontmatter`,
  );

  return {
    body: content.slice(frontmatter.length).trimStart(),
    frontmatter,
    metadata: input ?? {},
    paths,
  };
}
