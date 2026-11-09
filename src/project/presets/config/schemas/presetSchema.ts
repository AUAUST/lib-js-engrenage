import { declare, unset } from "#foundation/options/index";
import { presetNameSchema } from "#project/presets/config/schemas/presetNameSchema";

export const presetSchema = declare(presetNameSchema, {
  description: [
    "Kind of project the configuration builds on, among the presets extensions contribute, bundling traits and option values.",
    "`library` bundles `published`: it extends the library tsconfig, syncs the published `package.json` fields (`files`, `bin`, `engines.node`), tests the built package and selects the library GitHub workflows.",
    "Options and `traits` override it; `false` selects none.",
  ],
  optional: unset("no preset: no trait is bundled"),
  disable: { value: false },
});
