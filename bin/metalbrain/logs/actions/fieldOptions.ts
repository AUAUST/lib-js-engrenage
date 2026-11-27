import { findLogKind } from "#metalbrain/logs/index";
import {
  option,
  type CommandPath,
  type OptionDeclaration,
} from "#nexus/cli/index";
import type { RecordFields } from "#metalbrain/records/index";

export default function (path: CommandPath): readonly OptionDeclaration[] {
  const kind = findLogKind(path.at(-2) ?? "");

  const adding = path.at(-1) === "add";

  const fields: RecordFields = kind.fields;

  return Object.entries(fields).map(
    ([key, { type, description, requiredOnAdd }]) => {
      const collects = type === "sites" || type === "detail";

      return option({
        name: key,
        type: "string",
        placeholder: "text",
        description,
        required: (
          !collects && adding && (type === "text" || requiredOnAdd === true)
        ),
        ...(collects && { multiple: true }),
      });
    },
  );
}
