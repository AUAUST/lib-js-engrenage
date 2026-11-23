import { array, picklist } from "valibot";

import { declareNamespaceKind } from "#batiment/scopes/config/declarers/declareNamespaceKind";
import { namespaceSchema } from "#batiment/scopes/config/schemas/namespaceSchema";
import { declare, directorySchema } from "#foundation/options/index";

export function declareStructureOptions() {
  return {
    kind: declareNamespaceKind(),
    structure: namespaceSchema,
    optOut: declare(array(directorySchema), {
      description: "Directories, relative to the environment directory, that are never read as roles even though their name is one.",
      optional: { value: [] },
    }),
    strictness: declare(picklist(["strict", "loose"]), {
      description: "`strict` expects every directory to be classified; under `loose`, unclassified directories count as plain domains.",
      optional: { value: "strict" },
    }),
  };
}
