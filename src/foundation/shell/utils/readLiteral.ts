import type { ParamExp, WordPart } from "sh-syntax";

import { readPlainParameter } from "#foundation/shell/utils/readPlainParameter";
import { unescapeShell } from "#foundation/shell/utils/unescapeShell";

const unquotedExpansions = /[\s*?[]/;

function readBinding(
  part: ParamExp,
  quoted: boolean,
  bindings: ReadonlyMap<string, string>,
) {
  const name = readPlainParameter(part);
  const value = name === undefined ? undefined : bindings.get(name);

  if (value !== undefined) {
    return quoted || (value !== "" && !unquotedExpansions.test(value))
      ? value
      : undefined;
  }
}

export function readLiteral(
  parts: readonly WordPart[],
  quoted: boolean,
  bindings: ReadonlyMap<string, string>,
): string | undefined {
  let text = "";

  for (const part of parts) {
    if (part.type === "Lit") {
      text += unescapeShell(part.value, quoted ? "quoted" : "unquoted");
    } else if (part.type === "SglQuoted" && !part.dollar && !quoted) {
      text += part.value;
    } else if (part.type === "DblQuoted" && !part.dollar && !quoted) {
      const inner = readLiteral(part.parts, true, bindings);

      if (inner === undefined) {
        return;
      }

      text += inner;
    } else if (part.type === "ParamExp") {
      const value = readBinding(part, quoted, bindings);

      if (value === undefined) {
        return;
      }

      text += value;
    } else {
      return;
    }
  }

  return text;
}
