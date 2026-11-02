import {
  description,
  literal,
  optional,
  picklist,
  pipe,
  strictObject,
  union,
} from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { workflowSetNames } from "#github/constants";

export const githubSchema = strictObject({
  workflows: optional(
    pipe(
      union([literal(false), picklist(workflowSetNames)]),
      description(
        join(
          [
            "Workflow set that sync keeps in `.github/workflows`; `false` disables it.",
            "A set only updates workflow files that already exist and needs its `package.json` scripts.",
            "@default the set named like a preset in `presets` (`library`) when its required packages (`@changesets/cli`) are dependencies",
          ],
          "\n",
        ),
      ),
    ),
  ),
});
