import { picklist } from "valibot";

// @debt reaches into tools/github, a higher layer than project; the layered registry (#143) removes the upward dependency
import { workflowSetNames } from "#github/constants";
import { declare } from "#options/utils/declare";
import { declareObject } from "#options/utils/declareObject";
import { unset } from "#options/utils/unset";

export const githubSchema = declareObject(
  {
    workflows: declare(picklist(workflowSetNames), {
      description: [
        "Workflow set that sync keeps in `.github/workflows`; `false` disables it.",
        "A set only updates workflow files that already exist and needs its `package.json` scripts.",
      ],
      // @debt the set is resolved by resolveWorkflowSet from the presets and dependencies of the running step, which the init prompts can change, so the declaration only documents it
      disable: { value: false },
      optional: unset(
        "the set named like a preset in `presets` (`library`) when its required packages (`@changesets/cli`) are dependencies",
      ),
    }),
  },
  {
    optional: true,
  },
);
