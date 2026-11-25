import { string } from "valibot";

import { declare } from "#foundation/options/index";

// @debt `debt` is a `tools/metalbrain` concept declared here because batiment's member schemas are closed to contributed fields
// @debt role contracts are declared in `batiment/roles`, below `scopes`, so a role `debt` repeats this declaration there
export const debtSchema = declare(string(), {
  description: "Why the member does not fit the project's Compass, such as the earlier decision it stands on: agents decouple it at each opportunity and never take it as precedent.",
  optional: { value: undefined },
});
