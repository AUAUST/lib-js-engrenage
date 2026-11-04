import { picklist } from "valibot";

import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { unset } from "#foundation/options/utils/unset";
import { workflowSetNames } from "#tools/github/constants";

export const githubSchema = declareObject(
  {
    workflows: declare(picklist(workflowSetNames), {
      description: [
        "Workflow set that sync keeps in `.github/workflows`; `false` disables it.",
        "A set only updates workflow files that already exist and needs its `package.json` scripts.",
      ],
      // @debt the set is resolved by resolveWorkflowSet from the traits and dependencies of the running step, which the init prompts can change, so the declaration only documents it
      disable: { value: false },
      optional: unset(
        "the set whose trait is active (`library`: `published`) when its required packages (`@changesets/cli`) are dependencies",
      ),
    }),
  },
  {
    optional: true,
  },
);
