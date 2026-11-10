import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";
import { format } from "prettier";
import { parsers as acornParsers } from "prettier/plugins/acorn";
import { parsers as babelParsers } from "prettier/plugins/babel";
import { parsers as meriyahParsers } from "prettier/plugins/meriyah";
import { parsers as typescriptParsers } from "prettier/plugins/typescript";

import {
  filterMap,
  findLast,
  flatMap,
  sort,
} from "@auaust/primitive-kit/arrays";
import { isObject } from "@auaust/toolkit/isObject";
import { mappedValues } from "@auaust/toolkit/mappedValues";
import { values } from "@auaust/toolkit/object";

import { visitNodes } from "#tools/prettier/utils/visitNodes";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";
import type { LayoutEdit } from "#tools/prettier/types/LayoutEdit";
import type { Plugin } from "#tools/prettier/types/Plugin";

type Parser = NonNullable<Plugin["parsers"]>[string];

interface Range {
  start: number;
  end: number;
}

interface Replacement extends Range {
  text: string;
}

const stockParsers = {
  "typescript": typescriptParsers.typescript,
  "babel-ts": babelParsers["babel-ts"],
  "babel": babelParsers.babel,
  "acorn": acornParsers.acorn,
  "espree": acornParsers.espree,
  "meriyah": meriyahParsers.meriyah,
};

function isProgram(value: unknown): value is TSESTree.Program {
  return (
    isObject(value) && "type" in value && value.type === AST_NODE_TYPES.Program
  );
}

// @debt the ignored node is the outermost one starting after the comment, an approximation of Prettier's own comment attachment
function findIgnoredRanges(program: TSESTree.Program): readonly Range[] {
  // @debt native `filter`, since primitive-kit's `filter` types a predicate's result as an array of arrays
  const comments = (program.comments ?? []).filter((comment) => {
    return comment.value.trim() === "prettier-ignore";
  });

  const ignored = new Map<TSESTree.Comment, TSESTree.Node>();

  visitNodes(program, (node) => {
    for (const comment of comments) {
      const current = ignored.get(comment);

      if (
        node.range[0] >= comment.range[1] &&
        (current === undefined ||
          node.range[0] < current.range[0] ||
          (node.range[0] === current.range[0] &&
            node.range[1] > current.range[1]))
      ) {
        ignored.set(comment, node);
      }
    }
  });

  return filterMap(comments, (comment) => {
    const node = ignored.get(comment);

    if (node !== undefined) {
      return {
        start: comment.range[0],
        end: node.range[1],
      };
    }
  });
}

function isContentCharacter(character: string): boolean {
  return character.trim() !== "";
}

function toReplacement(
  text: string,
  edit: LayoutEdit,
): Replacement | undefined {
  if (edit.kind === "line-break") {
    const start = edit.offset + 1;

    return text.charAt(start) === "\n"
      ? undefined
      : {
          start,
          end: start,
          text: "\n",
        };
  }

  const end = text.lastIndexOf("\n", edit.offset - 1) + 1;

  let content = end;

  while (content > 0 && !isContentCharacter(text.charAt(content - 1))) {
    content -= 1;
  }

  if (content === 0) {
    return;
  }

  const start = text.indexOf("\n", content) + 1;

  const padding = edit.present ? "\n" : "";

  return text.slice(start, end) === padding
    ? undefined
    : {
        start,
        end,
        text: padding,
      };
}

function applyEdits(
  text: string,
  program: TSESTree.Program,
  edits: readonly LayoutEdit[],
): string {
  const ignoredRanges = findIgnoredRanges(program);

  const replacements = filterMap(edits, (edit) => {
    const ignored = ignoredRanges.some(({ start, end }) => {
      return edit.offset >= start && edit.offset < end;
    });

    return ignored ? undefined : toReplacement(text, edit);
  });

  const ordered = sort([...replacements], (first, second) => {
    return second.start - first.start || second.end - first.end;
  });

  let result = text;
  let previous: Replacement | undefined;

  for (const replacement of ordered) {
    if (
      previous?.start !== replacement.start ||
      previous.end !== replacement.end
    ) {
      result = (
        result.slice(0, replacement.start) +
        replacement.text +
        result.slice(replacement.end)
      );
    }

    previous = replacement;
  }

  return result;
}

function findParser(
  plugins: readonly Plugin[],
  name: string,
): Parser | undefined {
  return findLast(plugins, (plugin) => {
    return plugin.parsers?.[name] !== undefined;
  })?.parsers?.[name];
}

export function createLayoutPlugin(
  plugins: readonly Plugin[],
  conventions: Readonly<Record<string, LayoutConvention>>,
): Plugin {
  const layoutPlugin: Plugin = {
    parsers: mappedValues(stockParsers, (stock, name): Parser => {
      const parser = findParser(plugins, name) ?? stock;

      return {
        ...parser,
        // @debt the whole text is reformatted before Prettier reads `rangeStart`, `rangeEnd` and `cursorOffset`, which still point into the unformatted text
        async preprocess(text, options) {
          const source = parser.preprocess === undefined
            ? text
            : await parser.preprocess(text, options);

          const formatted = await format(source, {
            ...options,
            // @debt native `filter`, since primitive-kit's `filter` types a predicate's result as an array of arrays
            plugins: options.plugins.filter((plugin) => {
              return plugin !== layoutPlugin;
            }),
          });

          // @debt the `typescript` parser cannot read the Flow syntax the `babel` parser accepts, so such files fail to format
          const program = await typescriptParsers.typescript.parse(
            formatted,
            options,
          );

          if (!isProgram(program)) {
            throw new Error(
              "Prettier's `typescript` parser returned no program",
            );
          }

          const edits = flatMap(values(conventions), (convention) => {
            return convention(program, formatted);
          });

          return applyEdits(formatted, program, edits);
        },
      };
    }),
  };

  return layoutPlugin;
}
