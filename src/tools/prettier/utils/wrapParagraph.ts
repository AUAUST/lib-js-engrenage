const maximumOverflow = 3;
const overflowWeight = 4;
const codeSpanPattern = /`[^`]*`/g;

function isOpen(atom: string): boolean {
  if (atom.split("`").length % 2 === 0) {
    return true;
  }

  const prose = atom.replaceAll(codeSpanPattern, "");
  const linkStart = prose.lastIndexOf("{@link");

  return linkStart !== -1 && !prose.includes("}", linkStart);
}

function collectAtoms(words: readonly string[]): string[] {
  const atoms: string[] = [];

  let current: string | undefined;

  for (const word of words) {
    current = current == null ? word : `${current} ${word}`;

    if (isOpen(current)) {
      continue;
    }

    atoms.push(current);
    current = undefined;
  }

  if (current != null) {
    atoms.push(current);
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
    return Number.POSITIVE_INFINITY;
  }

  if (overflow > 0) {
    return overflowWeight * overflow ** 2;
  }

  return isLast ? 0 : overflow ** 2;
}

export function wrapParagraph(
  words: readonly string[],
  width: number,
): string[] {
  const atoms = collectAtoms(words);
  const costs = [0];
  const breaks = [0];

  for (let end = 1; end <= atoms.length; end += 1) {
    let best = Number.POSITIVE_INFINITY;
    let bestStart = end - 1;

    for (let start = end - 1; start >= 0; start -= 1) {
      const line = atoms.slice(start, end);

      if (line.join(" ").length > width + maximumOverflow && line.length > 1) {
        break;
      }

      const cost = (
        (costs[start] ?? Number.POSITIVE_INFINITY) +
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
