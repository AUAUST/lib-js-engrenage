import { array, picklist } from "valibot";

import { directorySchema } from "#foundation/options/config/schemas/directorySchema";
import { globSchema } from "#foundation/options/config/schemas/globsSchema";
import { declare } from "#foundation/options/utils/declare";
import { declareRecord } from "#foundation/options/utils/declareRecord";
import { domainSchema } from "#project/structure/config/schemas/domainSchema";
import { namespaceSchema } from "#project/structure/config/schemas/namespaceSchema";

export const structureOptions = {
  namespaces: declareRecord(directorySchema, namespaceSchema, {
    description: [
      "Grouping directories, by path relative to the environment directory (`.` is the environment directory itself).",
      "A namespace has no `index.ts` and no roles, holds domains and namespaces, and orders them with `layers`.",
    ],
    optional: {
      explain: "none, so namespaces are inferred",
      compute() {
        return {};
      },
    },
  }),
  domains: declareRecord(globSchema, domainSchema, {
    description: [
      "Metadata of domains, by path or glob relative to the environment directory.",
      "A path declaration also makes a directory a domain, even a role-named one; a glob only adds metadata.",
    ],
    optional: {
      value: {},
    },
  }),
  optOut: declare(array(directorySchema), {
    description:
      "Directories, relative to the environment directory, that are never read as roles even though their name is one.",
    optional: { value: [] },
  }),
  strictness: declare(picklist(["strict", "loose"]), {
    description:
      "`strict` expects every directory to be classified; under `loose`, unclassified directories count as plain domains.",
    optional: { value: "strict" },
  }),
};
