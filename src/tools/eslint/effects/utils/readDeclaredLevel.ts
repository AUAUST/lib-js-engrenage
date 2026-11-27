import {
  getJSDocTags,
  getTextOfJSDocComment,
  type Node as TsNode,
} from "typescript";

import {
  readDocTag,
  readEffectLevel,
  type TagDeclaration,
} from "#project/docs/index";

/**
 * The invocation level the first valid effect doc tag of `node` declares,
 * `undefined` when it carries none.
 */
export function readDeclaredLevel(
  node: TsNode,
  tags: readonly TagDeclaration[],
): string | undefined {
  for (const tag of getJSDocTags(node)) {
    const read = readDocTag(tags, {
      name: tag.tagName.text,
      text: getTextOfJSDocComment(tag.comment) ?? "",
      range: [tag.pos, tag.end],
    });

    const level = read.ok ? readEffectLevel(read.tag) : undefined;

    if (level !== undefined) {
      return level;
    }
  }
}
