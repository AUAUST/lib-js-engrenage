import { picklist } from "valibot";

import { keys } from "@auaust/toolkit/object";

import { declare, unset } from "#foundation/options/index";
import { presetTraits } from "#project/presets/constants";

export const presetSchema = declare(picklist(keys(presetTraits)), {
  description: [
    "Kind of project the configuration builds on, bundling traits.",
    "`library` bundles `published`: it extends the library tsconfig, syncs the published `package.json` fields (`files`, `bin`, `engines.node`), tests the built package and selects the library GitHub workflows.",
    "Options and `traits` override it.",
  ],
  optional: unset("no preset: no trait is bundled"),
});
