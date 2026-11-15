import { ceil, max } from "@auaust/toolkit/math";

const maximumOverflow = 3;
const overflowWeight = 4;
const lastLineMinimumShare = 1 / 3;
const codeSpanPattern = /`[^`]*`/g;

function isOpen(atom: string): boolean {
  if (atom.split("`").length % 2 === 0) {
    return true;
  }

  const prose = atom.replaceAll(codeSpanPattern, "");

  return (
    isUnclosed(prose, "{@link", "}") ||
    isUnclosed(prose, "[", "]") ||
    isUnclosed(prose, "](", ")")
  );
}

function isUnclosed(prose: string, opening: string, closing: string): boolean {
  const start = prose.lastIndexOf(opening);

  return start !== -1 && !prose.includes(closing, start + opening.length);
}

function collectAtoms(words: readonly string[]): string[] {
  const atoms: string[] = [];

  let start = 0;

  while (start < words.length) {
    let end = start + 1;
    let atom = words.slice(start, end).join(" ");

    while (isOpen(atom) && end < words.length) {
      end += 1;
      atom = words.slice(start, end).join(" ");
    }

    if (isOpen(atom)) {
      end = start + 1;
      atom = words.slice(start, end).join(" ");
    }

    atoms.push(atom);
    start = end;
  }

  return atoms;
}

function getLineCost(
  atoms: readonly string[],
  width: number,
  isLast: boolean,
): number {
  const length = atoms.join(" ").length;

  if (atoms.length === 1 && length > width) {
    return 0;
  }

  const overflow = length - width;

  if (
    overflow > maximumOverflow ||
    (overflow > 0 && atoms.some((atom) => atom.length > width))
  ) {
    return Infinity;
  }

  if (overflow > 0) {
    return overflowWeight * overflow ** 2;
  }

  if (!isLast) {
    return overflow ** 2;
  }

  return max(0, ceil(width * lastLineMinimumShare) - length) ** 2;
}

export function wrapParagraph(
  words: readonly string[],
  width: number,
): string[] {
  const atoms = collectAtoms(words);
  const costs = [0];
  const breaks = [0];

  for (let end = 1; end <= atoms.length; end += 1) {
    let best = Infinity;
    let bestStart = end - 1;

    for (let start = end - 1; start >= 0; start -= 1) {
      const line = atoms.slice(start, end);

      if (line.join(" ").length > width + maximumOverflow && line.length > 1) {
        break;
      }

      const cost = (
        (costs[start] ?? Infinity) +
        getLineCost(line, width, end === atoms.length)
      );

      if (cost >= best) {
        continue;
      }

      best = cost;
      bestStart = start;
    }

    costs.push(best);
    breaks.push(bestStart);
  }

  const lines: string[] = [];

  for (let end = atoms.length; end > 0; end = breaks[end] ?? 0) {
    lines.unshift(atoms.slice(breaks[end], end).join(" "));
  }

  return lines;
}
