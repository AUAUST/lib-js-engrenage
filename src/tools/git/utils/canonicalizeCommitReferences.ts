import { commitScissors } from "#tools/git/constants";
import { readCommitMessage } from "#tools/git/utils/readCommitMessage";

// @debt the canonical `Closes #<n>` and `Towards #<n>` form is restated by the patterns of `runMessageGate` and `listIssueCommits` instead of owned once by this domain
const referencePattern = /^\s*(close[sd]?|towards?)\b[\s,]*(#?\d+(?:[\s,]+#?\d+)*)[\s,]*$/iu;

const numberPattern = /\d+/gu;

const trailerPattern = /^[\w-]+:\s/u;

interface Body {
  readonly rest: readonly string[];
  readonly prose: readonly string[];
  readonly references: readonly string[];
  readonly trailers: readonly string[];
}

function isComment(line: string) {
  return line.startsWith("#");
}

function splitTrailers(body: readonly string[]) {
  const start = body.lastIndexOf("") + 1;

  const trailers = body.slice(start);

  if (start === 0 || !trailers.every((line) => trailerPattern.test(line))) {
    return { rest: body, trailers: [] };
  }

  const end = body.findLastIndex((line, index) => {
    return index < start && line !== "";
  });

  return { rest: body.slice(0, end + 1), trailers };
}

function collapseBlankLines(lines: readonly string[]): string[] {
  const collapsed: string[] = [];

  for (const line of lines) {
    if (line !== "" || (collapsed.length > 0 && collapsed.at(-1) !== "")) {
      collapsed.push(line);
    }
  }

  if (collapsed.at(-1) === "") {
    collapsed.pop();
  }

  return collapsed;
}

function readBody(body: readonly string[]): Body | undefined {
  const { rest, trailers } = splitTrailers(body);

  const closes = new Set<string>();
  const towards = new Set<string>();
  const others: string[] = [];

  for (const line of rest) {
    const match = referencePattern.exec(line);

    if (match === null) {
      others.push(line);

      continue;
    }

    const target = match[1].toLowerCase().startsWith("close")
      ? closes
      : towards;

    for (const [issue] of match[2].matchAll(numberPattern)) {
      target.add(issue);
    }
  }

  if (closes.size + towards.size === 0) {
    return;
  }

  return {
    rest,
    prose: collapseBlankLines(others),
    references: [
      ...[...closes].map((issue) => `Closes #${issue}`),
      ...[...towards]
        .filter((issue) => !closes.has(issue))
        .map((issue) => `Towards #${issue}`),
    ],
    trailers,
  };
}

function isCanonical(rest: readonly string[], references: readonly string[]) {
  const start = rest.length - references.length;

  return (
    (start === 0 || rest[start - 1] === "") &&
    references.every((line, index) => line === rest[start + index]) &&
    rest.slice(0, start).every((line) => !referencePattern.test(line))
  );
}

/**
 * Gathers the lines of a commit message's body that hold only `Closes` or
 * `Towards` references, written in any case, with or without `#`, across lines
 * and paragraphs, into one paragraph of `Closes #<n>` then `Towards #<n>` lines
 * ending the body, before its trailers. Every other line, comment lines and the
 * scissors section are kept.
 *
 * @returns The rewritten message, or `undefined` when the body holds no reference
 * or already holds them in that form.
 */
export function canonicalizeCommitReferences(
  message: string,
): string | undefined {
  const { body } = readCommitMessage(message);

  const parts = readBody(body);

  if (parts === undefined || isCanonical(parts.rest, parts.references)) {
    return;
  }

  const { prose, references, trailers } = parts;

  const all = message.split("\n");

  const scissors = all.indexOf(commitScissors);

  const head = scissors === -1 ? all : all.slice(0, scissors);

  const subject = head.findIndex((line) => {
    return !isComment(line) && line.trimEnd() !== "";
  });

  const comments = head.slice(subject + 1).filter(isComment);

  const rewritten = [
    ...head.slice(0, subject + 1),
    ...[prose, references, trailers]
      .filter((paragraphs) => paragraphs.length > 0)
      .flatMap((paragraphs) => {
        return ["", ...paragraphs];
      }),
    ...(comments.length === 0 ? [] : ["", ...comments]),
  ].join("\n");

  return scissors === -1
    ? `${rewritten}\n`
    : `${rewritten}\n${all.slice(scissors).join("\n")}`;
}
