import type { BlockSyntax } from "#types/BlockSyntax";

/**
 * The marker lines of a content in a block syntax, in order, each with its
 * directive, arguments, 1-based line and offset.
 */
export function listBlockMarkers(
  content: string,
  { open, close }: BlockSyntax,
): {
  directive: string;
  args: readonly string[];
  line: number;
  index: number;
}[] {
  const marker = new RegExp(
    String.raw`^${RegExp.escape(open)}@([\w-]+)((?: \S+)*)${RegExp.escape(close)}$`,
    "gm",
  );

  return [...content.matchAll(marker)].map((match) => {
    const [, directive = "", argumentList = ""] = match;

    return {
      directive,
      args: argumentList.split(" ").slice(1),
      line: content.slice(0, match.index).split("\n").length,
      index: match.index,
    };
  });
}
