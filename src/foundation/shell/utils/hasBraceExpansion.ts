import type { WordPart } from "sh-syntax";

const braceSequence = /\{(?:-?\d+\.\.-?\d+|[A-Za-z]\.\.[A-Za-z])(?:\.\.-?\d+)?\}/;

function readUnquoted(parts: readonly WordPart[]) {
  return parts
    .map((part) => {
      return part.type === "Lit" ? part.value.replaceAll(/\\./gs, "_") : "_";
    })
    .join("");
}

function hasBraceList(text: string) {
  const lists: boolean[] = [];

  for (const char of text) {
    if (char === "{") {
      lists.push(false);
    } else if (char === "," && lists.length > 0) {
      lists[lists.length - 1] = true;
    } else if (char === "}" && lists.pop() === true) {
      return true;
    }
  }

  return false;
}

export function hasBraceExpansion(parts: readonly WordPart[]) {
  const text = readUnquoted(parts);

  return braceSequence.test(text) || hasBraceList(text);
}
