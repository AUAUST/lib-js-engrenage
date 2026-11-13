import { isPromise } from "@auaust/toolkit/isPromise";

import { splitDocTag } from "#project/docs/utils/splitDocTag";
import type { JsdocTag } from "#foundation/jsdoc/index";
import type { DocTag } from "#project/docs/types/DocTag";
import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

type ReadDocTag =
  | { readonly ok: true; readonly tag: DocTag }
  | { readonly ok: false; readonly message: string };

function readValue(
  declaration: TagDeclaration,
  body: string,
): { readonly value: unknown } | { readonly message: string } {
  if (declaration.body === "none") {
    return { value: true };
  }

  if (declaration.schema === undefined) {
    return { value: body };
  }

  const result = declaration.schema["~standard"].validate(body);

  if (isPromise(result)) {
    throw new Error(
      `The schema of the doc tag "@${declaration.name}" validates asynchronously; doc tag schemas must validate synchronously`,
    );
  }

  if (result.issues !== undefined) {
    const issues = result.issues.map(({ message }) => message);

    return { message: `@${declaration.name}: ${issues.join("; ")}` };
  }

  return { value: result.value };
}

export function readDocTag(
  tags: readonly TagDeclaration[],
  tag: JsdocTag,
): ReadDocTag {
  const declaration = tags.find(({ name }) => name === tag.name);

  if (declaration === undefined) {
    return { ok: false, message: `@${tag.name} is not a declared doc tag.` };
  }

  const split = splitDocTag(declaration, tag.text);

  if (!split.ok) {
    return split;
  }

  const read = readValue(declaration, split.body);

  if ("message" in read) {
    return { ok: false, message: read.message };
  }

  const { type, subject } = split;

  return {
    ok: true,
    tag: {
      name: tag.name,
      ...(type === undefined ? {} : { type }),
      ...(subject === undefined ? {} : { subject }),
      value: read.value,
    },
  };
}
