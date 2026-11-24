import { string } from "valibot";

import { namespaceKindFields } from "#batiment/scopes/constants";
import {
  declare,
  declareObject,
  declareRecord,
  unset,
} from "#foundation/options/index";

const keepContributed = unset("the contributed kind's");

export const namespaceKindsSchema = declareRecord(
  string(),
  declareObject(
    {
      imports: declare(namespaceKindFields.imports.wrapped, {
        description: "The kinds whose namespaces in the same scope the kind's namespaces import, by relation, replacing the contributed kind's: `whole` any file, `surface` only a domain's `index`, `entry` and public roles.",
        optional: keepContributed,
      }),
      inward: declare(namespaceKindFields.inward.wrapped, {
        description: "What other namespaces' grants into the kind's namespaces yield, replacing the contributed kind's: `open` the grant as given, `surface` at most surface, `sealed` nothing.",
        optional: keepContributed,
      }),
    },
    {
      description: "The relations replacing those of one contributed namespace kind.",
    },
  ),
  {
    description: [
      "Overrides of the contributed namespace kinds' relations, by kind name, each set field replacing the kind's whole.",
      "A name no registered extension contributes as a kind, active or not, fails the config.",
    ],
    optional: {
      value: {},
    },
  },
);
