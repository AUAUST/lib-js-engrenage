import {
  doc,
  util,
  type AstPath,
  type Doc,
  type ParserOptions,
  type Printer,
} from "prettier";

import { isArray } from "@auaust/toolkit/isArray";
import { isObject } from "@auaust/toolkit/isObject";
import { isString } from "@auaust/toolkit/isString";
import { max } from "@auaust/toolkit/math";

import { isAstNode } from "#tools/prettier/utils/isAstNode";
import { keepsOwnBreak } from "#tools/prettier/utils/keepsOwnBreak";
import { printLines } from "#tools/prettier/utils/printLines";
import type { AstNode } from "#tools/prettier/types/AstNode";

type Print = Parameters<Printer<AstNode>["print"]>[2];

type DocumentStep = number | "contents";

interface Capture {
  readonly layout: string;
  readonly node: AstNode;
  readonly doc: Doc;
  readonly members: Doc | undefined;
}

const {
  conditionalGroup,
  group,
  hardlineWithoutBreakParent,
  ifBreak,
  indent,
  label,
  softline,
} = doc.builders;

// @debt the steps from Prettier's layout group to the right side's doc copy the shape of Prettier's internal `printAssignment`, which no API exposes
const rightSteps = new Map<string, readonly DocumentStep[]>([
  ["break-after-operator", [2, "contents", "contents", 1]],
  ["never-break-after-operator", [3]],
  ["fluid", [4, "contents"]],
  ["break-lhs", [3, "contents"]],
]);

const leftKeys = new Map([
  ["VariableDeclarator", "id"],
  ["AssignmentExpression", "left"],
]);

const statementContainers = new Set([
  "BlockStatement",
  "Program",
  "StaticBlock",
  "SwitchCase",
  "TSModuleBlock",
]);

function measureWidth(line = ""): number {
  return util.getStringWidth(line);
}

function hasLeadingOwnLineComment(
  node: AstNode,
  options: ParserOptions<AstNode>,
): boolean {
  const { comments } = node;

  return (
    isArray(comments) &&
    comments.some((comment) => {
      return (
        isAstNode(comment) &&
        comment.leading === true &&
        /^[^\S\n\r]*[\n\r]/u.test(
          options.originalText.slice(options.locEnd(comment)),
        )
      );
    })
  );
}

function hasBrokenLeftForm(node: AstNode): boolean {
  const key = leftKeys.get(node.type);

  if (key === undefined) {
    return (
      node.type !== "TSTypeAliasDeclaration" && isAstNode(node.typeAnnotation)
    );
  }

  const target = node[key];

  return (
    isAstNode(target) &&
    (target.type === "ObjectPattern" ||
      target.type === "ArrayPattern" ||
      isAstNode(target.typeAnnotation))
  );
}

// @debt the text before the left side is read from the syntax tree, so a statement that does not start its line (`for (const … =`, a comment before it) measures candidates 2 and 4 from the wrong column
function measurePrefix(path: AstPath<AstNode>): number {
  const { node, parent } = path;

  if (node.type === "AssignmentExpression") {
    return parent?.type === "ExpressionStatement" &&
      isAstNode(node.left) &&
      node.left.type === "ObjectPattern"
      ? "(".length
      : 0;
  }

  if (
    node.type !== "VariableDeclarator" ||
    parent?.type !== "VariableDeclaration" ||
    !isArray(parent.declarations) ||
    parent.declarations[0] !== node ||
    !isString(parent.kind)
  ) {
    return 0;
  }

  const exported = path.grandparent?.type === "ExportNamedDeclaration";

  const container: unknown = path.getParentNode(exported ? 2 : 1);

  if (!isAstNode(container) || !statementContainers.has(container.type)) {
    return 0;
  }

  const keywords = [
    exported ? "export " : "",
    parent.declare === true ? "declare " : "",
    `${parent.kind} `,
  ];

  return keywords.join("").length;
}

function breakRight(
  right: Capture,
  parenthesized: boolean,
  options: ParserOptions<AstNode>,
): Doc | undefined {
  if (printLines(right.doc, options, 0).length === 1) {
    return;
  }

  if (right.members !== undefined) {
    // @debt the members are read from the group Prettier prints a union in, since breaking that group alone needs its contents
    const members = (
      isObject(right.members) &&
      !isArray(right.members) &&
      right.members.type === "group"
    )
      ? right.members.contents
      : right.members;

    return group(indent([softline, members]), { shouldBreak: true });
  }

  return parenthesized
    ? group(["(", indent([softline, right.doc]), softline, ")"], {
        shouldBreak: true,
      })
    : group(right.doc, { shouldBreak: true });
}

function measureLine(offset: number, lines: readonly string[]): Doc {
  return [
    " ".repeat(max(0, offset + measureWidth(lines[0]))),
    lines.length > 1 ? hardlineWithoutBreakParent : "",
  ];
}

// @debt the measure reaches `fits` only because `fits` reads an `ifBreak` on a group not printed yet as flat, which Prettier does not document
function withMeasure(candidate: Doc, measure: Doc): Doc {
  const id = Symbol("assignment");

  return [
    group("", { id, shouldBreak: true }),
    ifBreak(candidate, measure, { groupId: id }),
  ];
}

function printCandidates(
  path: AstPath<AstNode>,
  options: ParserOptions<AstNode>,
  left: Doc,
  operator: Doc,
  right: Capture,
): Doc {
  const rightLines = printLines(right.doc, options, Infinity);

  const parenthesized = (
    right.members === undefined && !keepsOwnBreak(right.node, right.doc)
  );

  const broken = breakRight(right, parenthesized, options);

  const breaksBare = parenthesized && rightLines.length > 1;

  const leftLines = hasBrokenLeftForm(path.node)
    ? printLines(left, options, 0)
    : [];

  const brokenLeft = leftLines.length > 1
    ? group(left, { shouldBreak: true })
    : undefined;

  const offset = (
    measureWidth(leftLines.at(-1)) +
    measureWidth(printLines(operator, options, Infinity)[0]) +
    " ".length -
    measurePrefix(path)
  );

  const candidates: Doc[] = breaksBare
    ? []
    : [[left, operator, " ", right.doc]];

  if (brokenLeft !== undefined && !breaksBare) {
    candidates.push(
      withMeasure(
        [brokenLeft, operator, " ", right.doc],
        measureLine(offset, rightLines),
      ),
    );
  }

  if (broken !== undefined) {
    candidates.push([left, operator, " ", broken]);
  }

  if (brokenLeft !== undefined && broken !== undefined) {
    candidates.push(
      withMeasure(
        [brokenLeft, operator, " ", broken],
        measureLine(offset, printLines(broken, options, 0)),
      ),
    );
  }

  candidates.push([left, operator, " ", broken ?? right.doc]);

  return conditionalGroup(candidates);
}

function childAt(parent: Doc | undefined, step: DocumentStep): Doc | undefined {
  if (step !== "contents") {
    return isArray(parent) ? parent[step] : undefined;
  }

  return isObject(parent) && !isArray(parent) && "contents" in parent
    ? parent.contents
    : undefined;
}

function replaceLayout(
  target: Doc,
  rebuild: (layout: doc.builders.Group) => Doc | undefined,
): Doc | undefined {
  if (isArray(target)) {
    for (const [index, part] of target.entries()) {
      const replaced = replaceLayout(part, rebuild);

      if (replaced !== undefined) {
        return target.with(index, replaced);
      }
    }

    return;
  }

  if (isString(target) || !("contents" in target)) {
    return;
  }

  const rebuilt = target.type === "group" ? rebuild(target) : undefined;

  if (rebuilt !== undefined) {
    return rebuilt;
  }

  const contents = replaceLayout(target.contents, rebuild);

  return contents === undefined ? undefined : { ...target, contents };
}

export function printAssignment(
  path: AstPath<AstNode>,
  options: ParserOptions<AstNode>,
  print: Print,
  args: unknown,
  base: Printer<AstNode>,
): Doc {
  const marker = label("assignment-right", "");

  const captures: Capture[] = [];

  const printed = base.print(
    path,
    options,
    (selector, selectorArgs) => {
      const layout = (
        isObject(selectorArgs) && "assignmentLayout" in selectorArgs
      )
        ? selectorArgs.assignmentLayout
        : undefined;

      const node = isString(selector) ? path.node[selector] : undefined;

      if (
        !isString(layout) ||
        !rightSteps.has(layout) ||
        !isAstNode(node) ||
        hasLeadingOwnLineComment(node, options)
      ) {
        return print(selector, selectorArgs);
      }

      captures.push({
        layout,
        node,
        doc: print(selector, { assignmentLayout: "break-lhs" }),
        members: node.type === "TSUnionType"
          ? print(selector, {
              assignmentLayout: "break-after-operator",
            })
          : undefined,
      });

      return marker;
    },
    args,
  );

  const [right] = captures;

  if (right === undefined) {
    return printed;
  }

  const rearranged = replaceLayout(printed, (layout) => {
    const { contents } = layout;

    const steps = rightSteps.get(right.layout) ?? [];

    const reached = steps.reduce<Doc | undefined>(childAt, contents);

    if (!isArray(contents) || reached !== marker) {
      return;
    }

    const [leftPart, operator] = contents;

    const left = right.layout === "break-lhs"
      ? leftPart
      : childAt(leftPart, "contents");

    return left === undefined || operator === undefined
      ? undefined
      : printCandidates(path, options, left, operator, right);
  });

  if (rearranged === undefined) {
    throw new Error(
      `Prettier's "${right.layout}" assignment layout no longer has the shape the printer plugin rearranges`,
    );
  }

  return rearranged;
}
