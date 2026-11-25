import { min } from "@auaust/toolkit/math";

import { stopwords } from "#foundation/matching/constants";
import { createLiteralLeaf } from "#foundation/matching/utils/createLiteralLeaf";
import { createRegexLeaf } from "#foundation/matching/utils/createRegexLeaf";
import type { QueryLeaf } from "#foundation/matching/types/QueryLeaf";
import type { QueryNode } from "#foundation/matching/types/QueryNode";

type Operator = "AND" | "OR" | "NOT";

type Atom =
  | { readonly kind: "operator"; readonly operator: Operator }
  | { readonly kind: "node"; readonly node: QueryNode | undefined };

type Token = Atom | { readonly kind: "open" | "close" };

interface Segment {
  readonly openers: number;
  readonly closers: number;
  readonly core: string;
  readonly atom: Atom;
  readonly end: number;
}

const maximumNesting = 32;

const whitespace = /\s*/uy;
const openers = /\(*/uy;
const plainText = /\S*/uy;
const qualifier = /(-)?([\p{L}\p{N}_][\p{L}\p{N}_-]*):/uy;
const phraseEnd = /(?<!\\)"/gu;
const regexEnd = /(?<!\\)\/(?=\)*(?:\s|$))/gu;
const delimitedClosers = /\)*(?=\s|$)/uy;
const trailingClosers = /\)*$/u;
const escapedQuote = /\\"/gu;
const operators: ReadonlySet<string> = new Set<Operator>(["AND", "OR", "NOT"]);
const emptyQuery: QueryNode = { kind: "all", children: [] };

function isOperator(text: string): text is Operator {
  return operators.has(text);
}

function measure(pattern: RegExp, query: string, index: number) {
  pattern.lastIndex = index;

  return pattern.exec(query)?.[0].length;
}

function find(pattern: RegExp, query: string, index: number) {
  pattern.lastIndex = index;

  return pattern.exec(query)?.index;
}

function createLiteral(text: string): Atom {
  return { kind: "node", node: createLiteralLeaf("term", text) };
}

function createAtom(
  leaf: QueryLeaf | undefined,
  negated: boolean,
  core: string,
): Atom {
  if (leaf == null) {
    return createLiteral(core);
  }

  return { kind: "node", node: negated ? { kind: "not", child: leaf } : leaf };
}

function countPlainClosers(core: string) {
  const run = trailingClosers.exec(core)?.[0].length ?? 0;

  let depth = 0;

  for (const character of core.slice(0, core.length - run)) {
    if (character === "(") {
      depth++;
    } else if (character === ")" && depth > 0) {
      depth--;
    }
  }

  return run - min(depth, run);
}

function readDelimited(
  query: string,
  start: number,
  field: string | undefined,
) {
  const delimiter = query[start];

  if (delimiter !== '"' && delimiter !== "/") {
    return;
  }

  // @debt each token opening with `"` or `/` searches the rest of the query for its end, quadratic on a long query of such tokens; precomputed end positions would keep the scan linear
  const close = find(
    delimiter === '"' ? phraseEnd : regexEnd,
    query,
    start + 1,
  );

  const closers = close == null
    ? undefined
    : measure(delimitedClosers, query, close + 1);

  if (close == null || closers == null) {
    return;
  }

  const content = query.slice(start + 1, close);

  const leaf = delimiter === '"'
    ? createLiteralLeaf("phrase", content.replaceAll(escapedQuote, '"'), field)
    : createRegexLeaf(content, field);

  if (delimiter === "/" && leaf == null) {
    return;
  }

  return {
    end: close + 1 + closers,
    closers,
    leaf,
  };
}

function readSegment(
  query: string,
  start: number,
  fields: ReadonlySet<string>,
): Segment {
  const opened = measure(openers, query, start) ?? 0;
  const coreStart = start + opened;

  qualifier.lastIndex = coreStart;

  const prefix = qualifier.exec(query);
  const field = prefix?.[2];
  const known = prefix != null && field != null && fields.has(field);
  const qualified = known ? field : undefined;
  const negated = known && prefix[1] != null;
  const valueStart = known ? coreStart + prefix[0].length : coreStart;
  const delimited = readDelimited(query, valueStart, qualified);

  if (delimited != null) {
    const core = query.slice(coreStart, delimited.end - delimited.closers);

    return {
      openers: opened,
      closers: delimited.closers,
      core,
      atom: createAtom(delimited.leaf, negated, core),
      end: delimited.end,
    };
  }

  const end = coreStart + (measure(plainText, query, coreStart) ?? 0);
  const closers = countPlainClosers(query.slice(coreStart, end));
  const core = query.slice(coreStart, end - closers);
  const value = query.slice(valueStart, end - closers);

  if (!known && isOperator(value)) {
    return {
      openers: opened,
      closers,
      core,
      atom: { kind: "operator", operator: value },
      end,
    };
  }

  const leaf = createLiteralLeaf("term", value, qualified);

  return {
    openers: opened,
    closers,
    core,
    atom: createAtom(leaf, negated, core),
    end,
  };
}

function readSegments(query: string, fields: ReadonlySet<string>) {
  const segments: Segment[] = [];

  let index = measure(whitespace, query, 0) ?? 0;

  while (index < query.length) {
    const segment = readSegment(query, index, fields);

    segments.push(segment);

    index = segment.end + (measure(whitespace, query, segment.end) ?? 0);
  }

  return segments;
}

function tokenize(segments: readonly Segment[]) {
  const stack: Segment[] = [];
  const looseOpeners = new Map<Segment, number>();
  const looseClosers = new Map<Segment, number>();

  function loosen(counts: Map<Segment, number>, segment: Segment) {
    counts.set(segment, (counts.get(segment) ?? 0) + 1);
  }

  for (const segment of segments) {
    for (let count = 0; count < segment.openers; count++) {
      if (stack.length < maximumNesting) {
        stack.push(segment);
      } else {
        loosen(looseOpeners, segment);
      }
    }

    for (let count = 0; count < segment.closers; count++) {
      if (stack.pop() == null) {
        loosen(looseClosers, segment);
      }
    }
  }

  for (const segment of stack) {
    loosen(looseOpeners, segment);
  }

  const tokens: Token[] = [];

  for (const segment of segments) {
    const opened = looseOpeners.get(segment) ?? 0;
    const closed = looseClosers.get(segment) ?? 0;

    const atom = opened + closed === 0
      ? segment.atom
      : createLiteral(
          `${"(".repeat(opened)}${segment.core}${")".repeat(closed)}`,
        );

    for (let count = opened; count < segment.openers; count++) {
      tokens.push({ kind: "open" });
    }

    if (atom.kind === "operator" || atom.node != null) {
      tokens.push(atom);
    }

    for (let count = closed; count < segment.closers; count++) {
      tokens.push({ kind: "close" });
    }
  }

  return tokens;
}

function combine(
  kind: "all" | "any",
  children: readonly (QueryNode | undefined)[],
): QueryNode | undefined {
  const present = children.filter((child) => {
    return child != null;
  });

  if (present.length <= 1) {
    return present[0];
  }

  return kind === "all"
    ? { kind, children: present }
    : {
        kind,
        children: present,
        min: 1,
      };
}

function isOperatorToken(
  token: Token | undefined,
  operator: Operator,
): boolean {
  return token?.kind === "operator" && token.operator === operator;
}

function startsOperand(token: Token | undefined) {
  return (
    token?.kind === "node" ||
    token?.kind === "open" ||
    isOperatorToken(token, "NOT")
  );
}

function buildTree(tokens: readonly Token[]) {
  let index = 0;

  function readLiteral(operator: Operator) {
    index++;

    return createLiteralLeaf("term", operator);
  }

  function parseAny(): QueryNode | undefined {
    const branches = [parseAll()];

    while (isOperatorToken(tokens[index], "OR")) {
      index++;
      branches.push(parseAll());
    }

    return combine("any", branches);
  }

  function parseAll() {
    const operands: (QueryNode | undefined)[] = [];

    for (
      let token = tokens[index];
      token != null && token.kind !== "close";
      token = tokens[index]
    ) {
      if (token.kind !== "operator" || token.operator === "NOT") {
        operands.push(parseNot());

        continue;
      }

      const joins = (
        operands.some((operand) => {
          return operand != null;
        }) && startsOperand(tokens[index + 1])
      );

      if (joins && token.operator === "OR") {
        break;
      }

      if (joins) {
        index++;
      } else {
        operands.push(readLiteral(token.operator));
      }
    }

    return combine("all", operands);
  }

  function parseNot(negated = false): QueryNode | undefined {
    const token = tokens[index];

    if (token?.kind === "open") {
      index++;

      const inner = parseAny();

      index++;

      return inner;
    }

    if (token?.kind === "operator") {
      if (negated || !startsOperand(tokens[index + 1])) {
        return readLiteral(token.operator);
      }

      index++;

      const child = parseNot(true);

      return child == null ? undefined : { kind: "not", child };
    }

    index++;

    return token?.kind === "node" ? token.node : undefined;
  }

  return parseAny();
}

function isBareStopword(leaf: QueryLeaf) {
  return (
    leaf.kind === "term" && leaf.field == null && stopwords.has(leaf.value)
  );
}

function hasOnlyStopwords(node: QueryNode): boolean {
  if (node.kind === "all" || node.kind === "any") {
    return node.children.every(hasOnlyStopwords);
  }

  if (node.kind === "not") {
    return hasOnlyStopwords(node.child);
  }

  return isBareStopword(node);
}

function dropStopwords(node: QueryNode): QueryNode | undefined {
  if (node.kind === "all" || node.kind === "any") {
    return combine(node.kind, node.children.map(dropStopwords));
  }

  if (node.kind === "not") {
    const child = dropStopwords(node.child);

    return child == null ? undefined : { kind: "not", child };
  }

  return isBareStopword(node) ? undefined : node;
}

/**
 * The query tree of `query` in the query syntax, its qualifiers restricted to
 * `fields`, for any string: unbalanced parentheses, unknown fields, invalid
 * regexes and operators missing an operand read as literal terms; bare
 * stopword terms are dropped unless every leaf is one; a query leaving no
 * leaf is an empty `all`.
 */
export function parseQuery(query: string, fields: Iterable<string>): QueryNode {
  const tokens = tokenize(readSegments(query, new Set(fields)));
  const tree = buildTree(tokens);

  if (tree == null) {
    return emptyQuery;
  }

  if (hasOnlyStopwords(tree)) {
    return tree;
  }

  return dropStopwords(tree) ?? emptyQuery;
}
