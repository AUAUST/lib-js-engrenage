import {
  applyEdits,
  createScanner,
  findNodeAtLocation,
  modify,
  parseTree,
  type JSONPath,
  type ModificationOptions,
} from "jsonc-parser";

import { isNumber } from "@auaust/toolkit/isNumber";

import type { JsonIndentation } from "#foundation/json/types/JsonIndentation";
import type { JsonValue } from "#foundation/json/types/JsonValue";
import type { File } from "#types/File";

export function writeJsonValue(
  content: string,
  path: File,
  location: JSONPath,
  value: JsonValue | undefined,
  indentation: JsonIndentation,
  options: Omit<ModificationOptions, "formattingOptions"> = {},
): string {
  try {
    const index = location.at(-1);

    if (value === undefined && isNumber(index)) {
      const tree = parseTree(content);

      if (tree === undefined) {
        throw new Error("Missing JSON value");
      }

      const parent = findNodeAtLocation(tree, location.slice(0, -1));

      const member =
        parent?.type === "array" ? parent.children?.[index] : undefined;

      if (member !== undefined) {
        const edits = [
          {
            offset: member.offset,
            length: member.length,
            content: "",
          },
        ];

        const scanner = createScanner(content, true);

        scanner.setPosition(member.offset + member.length);

        scanner.scan();

        if (content[scanner.getTokenOffset()] === ",") {
          edits.push({
            offset: scanner.getTokenOffset(),
            length: scanner.getTokenLength(),
            content: "",
          });
        } else if (index > 0) {
          const previous = parent?.children?.[index - 1];

          if (previous === undefined) {
            throw new Error("Missing preceding array member");
          }

          scanner.setPosition(previous.offset + previous.length);

          scanner.scan();

          if (content[scanner.getTokenOffset()] !== ",") {
            throw new Error("Missing array separator");
          }

          edits.push({
            offset: scanner.getTokenOffset(),
            length: scanner.getTokenLength(),
            content: "",
          });
        }

        return applyEdits(content, edits);
      }
    }

    const edits = modify(content, location, value, {
      isArrayInsertion: false,
      ...options,
      formattingOptions: indentation,
    });

    return applyEdits(content, edits);
  } catch (error) {
    throw new Error(`Cannot set "${location.join(" > ")}" in ${path}`, {
      cause: error,
    });
  }
}
