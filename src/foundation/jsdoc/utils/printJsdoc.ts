import type { JsdocBlock } from "#foundation/jsdoc/types/JsdocBlock";

export function printJsdoc(block: JsdocBlock): string {
  const descriptionLines = block.description === ""
    ? []
    : block.description.split("\n");

  const separatorLines = descriptionLines.length > 0 && block.tags.length > 0
    ? [""]
    : [];

  const tagLines = block.tags.flatMap((tag) => {
    const [first = "", ...rest] = tag.text.split("\n");

    return [first === "" ? `@${tag.name}` : `@${tag.name} ${first}`, ...rest];
  });

  const bodyLines = [...descriptionLines, ...separatorLines, ...tagLines].map(
    (line) => {
      return line === "" ? `${block.indent} *` : `${block.indent} * ${line}`;
    },
  );

  return [`${block.indent}/**`, ...bodyLines, `${block.indent} */`].join("\n");
}
