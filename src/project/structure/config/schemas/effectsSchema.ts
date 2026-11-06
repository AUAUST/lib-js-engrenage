import { string } from "valibot";

import { declare, declareObject, unset } from "#foundation/options/index";
import { effectLevelsSchema } from "#project/structure/config/schemas/effectLevelsSchema";
import { effectModulesSchema } from "#project/structure/config/schemas/effectModulesSchema";

export const effectsSchema = declareObject(
  {
    levels: declare(effectLevelsSchema, {
      description:
        "Effect levels, purest first, compared by index. They must contain `pure`, `confined` and `effectful` in that order and may add levels anywhere around them.",
      optional: unset("`pure`, `confined`, `effectful`"),
    }),
    modules: declare(effectModulesSchema, {
      description:
        "Levels of external modules, as a record of specifier glob to level or a function from a specifier to a level or `undefined`. A module is ranked by them, then by the built-in ranking of `node:*` builtins, then by `fallback`.",
      optional: unset("none, so only the built-in ranking applies"),
    }),
    fallback: declare(string(), {
      description:
        "Level of an external module that nothing else ranks. Unset, such a module is unchecked.",
      optional: unset("none, so unranked modules are unchecked"),
    }),
  },
  {
    description:
      "Effect levels of roles and of the external modules they import, shared by every environment.",
    optional: true,
  },
);
