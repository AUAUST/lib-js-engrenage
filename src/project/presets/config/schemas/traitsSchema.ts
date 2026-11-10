import { array, picklist } from "valibot";

import { declare, declareObject } from "#foundation/options/index";
import { traits } from "#project/presets/constants";

const traitSchema = picklist(traits);

export const traitsSchema = declareObject(
  {
    enable: declare(array(traitSchema), {
      description: "Traits to turn on, whatever the preset bundles. `published`: the project is distributed (a library) and tested as built.",
      optional: { value: [] },
    }),
    disable: declare(array(traitSchema), {
      description: "Traits the preset bundles to turn off; `enable` wins over it.",
      optional: { value: [] },
    }),
  },
  {
    description: "Traits of the project, adjusting those of the preset.",
    optional: true,
  },
);
