import { boolean, string } from "valibot";

import { declare, declareObject } from "#foundation/options/index";

export const domainSchema = declareObject({
  specifier: declare(string(), {
    description:
      "Public specifier of the domain, overriding the one derived from its path.",
    optional: { value: undefined },
  }),
  purpose: declare(string(), {
    description: "One line stating the domain's concern.",
    optional: { value: undefined },
  }),
  internals: declare(boolean(), {
    description: "Overrides `structure.internals` for this domain.",
    optional: { value: undefined },
  }),
});
