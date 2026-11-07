import { boolean } from "valibot";

import { declare, declareObject, unset } from "#foundation/options/index";

export const vscodeSchema = declareObject(
  {
    settings: declare(boolean(), {
      description: [
        "Whether sync writes the integration settings of the project's tools into `.vscode/settings.json`.",
        "`true` creates the file, `false` leaves it alone.",
      ],
      optional: unset("kept when the file exists"),
    }),
    extensions: declare(boolean(), {
      description: [
        "Whether sync adds the extensions recommended for the project's tools to `.vscode/extensions.json`.",
        "`true` creates the file, `false` leaves it alone.",
      ],
      optional: unset("kept when the file exists"),
    }),
  },
  {
    optional: true,
  },
);
