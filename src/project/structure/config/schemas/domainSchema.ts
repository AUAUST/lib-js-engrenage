import { boolean, string } from "valibot";

import { declare, declareObject } from "#foundation/options/index";

export const domainSchema = declareObject({
  public: declare(boolean(), {
    description: "Whether the domain is part of the package's public API.",
    optional: { value: false },
  }),
  specifier: declare(string(), {
    description:
      "Public specifier of the domain, overriding the one derived from its path.",
    optional: { value: undefined },
  }),
  purpose: declare(string(), {
    description: "One line stating the domain's concern.",
    optional: { value: undefined },
  }),
});
