import { array, picklist, string } from "valibot";

import { namespaceSchema } from "#batiment/environments/config/schemas/namespaceSchema";
import { declare, directorySchema } from "#foundation/options/index";

export function declareStructureOptions() {
  return {
    structure: namespaceSchema,
    optOut: declare(array(directorySchema), {
      description: "Directories, relative to the environment directory, that are never read as roles even though their name is one.",
      optional: { value: [] },
    }),
    strictness: declare(picklist(["strict", "loose"]), {
      description: "`strict` expects every directory to be classified; under `loose`, unclassified directories count as plain domains.",
      optional: { value: "strict" },
    }),
    languages: declare(array(string()), {
      description: "Names of the registered languages the environment holds; defaults to its kind's `languages`.",
      optional: { value: undefined },
    }),
  };
}
