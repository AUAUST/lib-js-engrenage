import { boolean, description, optional, pipe, strictObject } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

export const vscodeSchema = strictObject({
  settings: optional(
    pipe(
      boolean(),
      description(
        join(
          [
            "Whether sync writes the integration settings of the project's tools into `.vscode/settings.json`.",
            "`true` creates the file, `false` leaves it alone.",
            "@default kept when the file exists",
          ],
          "\n",
        ),
      ),
    ),
  ),
  extensions: optional(
    pipe(
      boolean(),
      description(
        join(
          [
            "Whether sync adds the extensions recommended for the project's tools to `.vscode/extensions.json`.",
            "`true` creates the file, `false` leaves it alone.",
            "@default kept when the file exists",
          ],
          "\n",
        ),
      ),
    ),
  ),
});
