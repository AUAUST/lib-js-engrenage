import { picklist } from "valibot";

import { declare, unset } from "#foundation/options/index";
import { visibilities } from "#project/package/constants";

export const visibilitySchema = declare(picklist(visibilities), {
  description: [
    "Who may install the published package from npm: `public` for anyone, `private` for members of its scope (`restricted` access).",
    "Applies only under the `published` trait; an unpublished package has no visibility.",
  ],
  optional: unset(
    "the `publishConfig.access` of `package.json` (`public` or `restricted`), else `private`",
  ),
});
