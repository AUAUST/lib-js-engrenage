import { findLogKind } from "#metalbrain/logs/index";
import {
  option,
  type CommandPath,
  type OptionDeclaration,
} from "#nexus/cli/index";

export default function (path: CommandPath): readonly OptionDeclaration[] {
  const kind = findLogKind(path.at(-2) ?? "");

  return Object.entries(kind.fields)
    .filter(([, { type }]) => {
      return type === "line";
    })
    .map(([key]) => {
      return option({
        name: key,
        type: "string",
        placeholder: "text",
        description: `only entries whose ${key} is <text>`,
      });
    });
}
