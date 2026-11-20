import { createRequire } from "node:module";

import type {
  CallExpr,
  DeclClause,
  File,
  ForClause,
  Redirect,
  Stmt,
  Word,
  WordPart,
} from "sh-syntax";
import type {
  BinCmdOperator,
  createSourceIndex,
  LangVariant,
  parse,
  ParseError,
  RedirOperator,
} from "sh-syntax/sync";

import { isArray } from "@auaust/toolkit";

import { ShellSyntaxError } from "#foundation/shell/errors/ShellSyntaxError";
import { isNode } from "#foundation/shell/utils/isNode";
import { isRebound } from "#foundation/shell/utils/isRebound";
import { readLiteral } from "#foundation/shell/utils/readLiteral";
import { unescapeShell } from "#foundation/shell/utils/unescapeShell";
import type { ShellAssignment } from "#foundation/shell/types/ShellAssignment";
import type { ShellCommand } from "#foundation/shell/types/ShellCommand";
import type { ShellRedirect } from "#foundation/shell/types/ShellRedirect";
import type { ShellWord } from "#foundation/shell/types/ShellWord";

interface Parser {
  readonly parse: typeof parse;
  readonly ParseError: typeof ParseError;
  readonly LangVariant: typeof LangVariant;
  readonly BinCmdOperator: typeof BinCmdOperator;
  readonly RedirOperator: typeof RedirOperator;
  readonly createSourceIndex: typeof createSourceIndex;
}

let parser: Parser | undefined;

function loadParser(): Parser {
  // @debt `createRequire` returns `any`: the annotation trusts `sh-syntax/sync` to match its own declarations.
  parser ??= createRequire(import.meta.url)("sh-syntax/sync") as Parser;

  return parser;
}

function isQuotedDelimiter(delimiter: Word | null) {
  return (
    delimiter?.parts.some((part) => {
      return part.type !== "Lit" || part.value.includes("\\");
    }) ?? false
  );
}

function readHeredocBody(
  parts: readonly WordPart[],
  quoted: boolean,
): string | undefined {
  let text = "";

  for (const part of parts) {
    if (part.type !== "Lit") {
      return;
    }

    text += quoted ? part.value : unescapeShell(part.value, "heredoc");
  }

  return text;
}

function readSubstitution(word: Word) {
  const [part, ...others] = word.parts;

  if (others.length > 0) {
    return;
  }

  if (part?.type === "CmdSubst") {
    return part;
  }

  if (part?.type !== "DblQuoted" || part.parts.length !== 1) {
    return;
  }

  const [inner] = part.parts;

  return inner?.type === "CmdSubst" ? inner : undefined;
}

function createReader(
  source: string,
  file: File,
  { BinCmdOperator, RedirOperator, createSourceIndex }: Parser,
) {
  const pipeOperators = new Set<number>([
    BinCmdOperator.Pipe,
    BinCmdOperator.PipeAll,
  ]);

  const toIndex = createSourceIndex(source);
  const bindings = new Map<string, string>();

  function slice(start: number, end: number) {
    return source.slice(toIndex(start), toIndex(end));
  }

  function readStatements(
    statements: readonly Stmt[],
    sink: ShellCommand[],
    top: ShellCommand[],
  ) {
    for (const statement of statements) {
      readStatement(statement, undefined, sink, top);
    }
  }

  function walk(value: unknown, sink: ShellCommand[]) {
    if (isArray(value)) {
      for (const item of value) {
        walk(item, sink);
      }

      return;
    }

    if (!isNode(value)) {
      return;
    }

    if (value.type === "Stmt") {
      return void readStatement(value, undefined, sink, []);
    }

    if (value.type === "CmdSubst" || value.type === "ProcSubst") {
      return void readStatements(value.stmts, sink, []);
    }

    for (const child of Object.values(value)) {
      walk(child, sink);
    }
  }

  function readWord(word: Word, sink: ShellCommand[]): ShellWord {
    const text = readLiteral(word.parts, false, bindings);

    return text === undefined
      ? readExpansion(word, sink)
      : { kind: "literal", text };
  }

  function readExpansion(word: Word, sink: ShellCommand[]): ShellWord {
    const wordSource = slice(word.start, word.end);
    const substitution = readSubstitution(word);

    if (substitution === undefined) {
      walk(word.parts, sink);

      return { kind: "expansion", source: wordSource };
    }

    const commands: ShellCommand[] = [];

    readStatements(substitution.stmts, sink, commands);

    return {
      kind: "substitution",
      source: wordSource,
      commands,
    };
  }

  function readHeredoc(
    { op, word: delimiter }: Redirect,
    body: Word,
    sink: ShellCommand[],
  ): ShellWord {
    const text = readHeredocBody(body.parts, isQuotedDelimiter(delimiter));

    if (text === undefined) {
      return readExpansion(body, sink);
    }

    const lines = op === RedirOperator.DashHdoc
      ? text.replaceAll(/^\t+/gm, "")
      : text;

    return { kind: "literal", text: lines.replace(/\n$/, "") };
  }

  function readRedirects(statement: Stmt, sink: ShellCommand[]) {
    return statement.redirs.map((redirect): ShellRedirect => {
      const target = redirect.word;

      return {
        operator: slice(redirect.start, target?.start ?? redirect.end).trim(),
        target: target == null
          ? { kind: "literal", text: "" }
          : readWord(target, sink),
        heredoc: redirect.hdoc == null
          ? undefined
          : readHeredoc(redirect, redirect.hdoc, sink),
      };
    });
  }

  function readAssignments(
    command: CallExpr | DeclClause,
    sink: ShellCommand[],
  ): ShellAssignment[] {
    const assigns = command.type === "CallExpr"
      ? command.assigns
      : [...command.assigns, ...command.args];

    return assigns.flatMap((assign): ShellAssignment[] => {
      if (assign.name == null) {
        walk(assign, sink);

        return [];
      }

      if (assign.array != null) {
        walk(assign.array, sink);
      }

      return [
        {
          name: assign.name.value,
          value: assign.value != null
            ? readWord(assign.value, sink)
            : assign.array == null
              ? { kind: "literal", text: "" }
              : {
                  kind: "expansion",
                  source: slice(assign.array.start, assign.array.end),
                },
        },
      ];
    });
  }

  function readSimple(
    statement: Stmt,
    command: CallExpr | DeclClause,
    input: ShellCommand | undefined,
    sink: ShellCommand[],
    top: ShellCommand[],
  ) {
    const nested: ShellCommand[] = [];
    const assignments = readAssignments(command, nested);

    const words = command.type === "CallExpr"
      ? command.args.map((word) => readWord(word, nested))
      : command.variant == null
        ? []
        : [{ kind: "literal", text: command.variant.value } as const];

    const simple: ShellCommand = {
      words,
      assignments,
      redirects: readRedirects(statement, nested),
      input,
    };

    sink.push(simple, ...nested);
    top.push(simple);

    return simple;
  }

  // @debt only `for` loops over literal words bind their variable: `while read`, `xargs`, arrays, `seq` and C-style loops leave it an expansion, and `isRebound` misses a binding hidden in an `eval` string past its start, a sourced file or a `declare -n` reference
  function readLoopValues({ select, loop }: ForClause) {
    if (
      select ||
      loop?.type !== "WordIter" ||
      loop.name == null ||
      loop.names.length > 0 ||
      loop.items.length === 0 ||
      isRebound(file.stmts, loop.name.value, loop.name)
    ) {
      return;
    }

    const values = [];

    for (const item of loop.items) {
      const value = readLiteral(item.parts, false, bindings);

      if (value === undefined) {
        return;
      }

      values.push(value);
    }

    return { name: loop.name.value, values };
  }

  function readLoop(command: ForClause, sink: ShellCommand[]) {
    const loop = readLoopValues(command);

    if (loop === undefined) {
      return false;
    }

    for (const value of loop.values) {
      bindings.set(loop.name, value);
      readStatements(command.do, sink, []);
    }

    bindings.delete(loop.name);

    return true;
  }

  function readStatement(
    statement: Stmt,
    input: ShellCommand | undefined,
    sink: ShellCommand[],
    top: ShellCommand[],
  ): ShellCommand | undefined {
    const command = statement.cmd;

    if (command === null) {
      return void walk(statement.redirs, sink);
    }

    if (command.type === "CallExpr" || command.type === "DeclClause") {
      return readSimple(statement, command, input, sink, top);
    }

    if (command.type === "BinaryCmd") {
      const left = command.x === null
        ? undefined
        : readStatement(command.x, input, sink, top);

      const piped = pipeOperators.has(command.op) ? left : undefined;

      const right = command.y === null
        ? undefined
        : readStatement(command.y, piped, sink, top);

      walk(statement.redirs, sink);

      return right;
    }

    if (command.type !== "ForClause" || !readLoop(command, sink)) {
      walk(command, sink);
    }

    walk(statement.redirs, sink);
  }

  return { readStatements };
}

function readColumn(
  source: string,
  offset: number,
  { createSourceIndex }: Parser,
) {
  const before = source.slice(0, createSourceIndex(source)(offset));

  return before.length - before.lastIndexOf("\n");
}

/**
 * Lists every simple command the Bash `source` runs, in source order, each command
 * nested in a substitution following the command holding it. A `for` loop over
 * literal words lists its body once per word, the loop variable read as that word.
 */
export function parseShell(source: string): readonly ShellCommand[] {
  const loaded = loadParser();
  const { parse, ParseError, LangVariant } = loaded;

  let file;

  try {
    file = parse(source, { variant: LangVariant.LangBash });
  } catch (error) {
    if (error instanceof ParseError) {
      throw new ShellSyntaxError(
        error.text,
        error.pos?.line ?? 0,
        error.pos == null ? 0 : readColumn(source, error.pos.offset, loaded),
      );
    }

    throw error;
  }

  const commands: ShellCommand[] = [];

  createReader(source, file, loaded).readStatements(file.stmts, commands, []);

  return commands;
}
