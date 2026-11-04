import { wrap } from "@auaust/primitive-kit/arrays";

import { declare } from "#foundation/options/utils/declare";
import { presetListSchema } from "#project/config/config/schemas/values/presetListSchema";

export const presetsSchema = declare(presetListSchema, {
  description: [
    "Kinds of project the configuration builds on.",
    "`library` extends the library tsconfig, syncs the published `package.json` fields (`files`, `bin`, `engines.node`) and selects the library GitHub workflows.",
  ],
  optional: { value: [] },
  adjust(input) {
    return wrap(input);
  },
});
