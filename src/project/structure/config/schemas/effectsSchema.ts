import { string } from "valibot";

import { declare, declareObject, unset } from "#foundation/options/index";
import { effectLevelsSchema } from "#project/structure/config/schemas/effectLevelsSchema";
import { effectModulesSchema } from "#project/structure/config/schemas/effectModulesSchema";

export const effectsSchema = declareObject(
  {
    levels: declare(effectLevelsSchema, {
      description: "Effect levels, purest first, compared by index. They must contain `pure`, `confined`, `observing` and `effectful` in that order and may add levels anywhere around them.",
      optional: unset("`pure`, `confined`, `observing`, `effectful`"),
    }),
    modules: declare(effectModulesSchema, {
      description: "Levels of external modules, as a record of specifier glob to entry or a function from a specifier to an entry or `undefined`. An entry is a level or `{ default: level, symbols: { [exportName]: level } }`; `symbols.default` ranks the default export. Configured entries override the shipped table, then `fallback` ranks unknown modules. Namespace imports take the highest entry level.",
      optional: unset("none, so only the shipped table applies"),
    }),
    fallback: declare(string(), {
      description: "Level of an external module that nothing else ranks. Unset, such a module is unchecked.",
      optional: unset("none, so unranked modules are unchecked"),
    }),
  },
  {
    description: "Effect levels of roles and of the external modules they import, shared by every environment.",
    optional: true,
  },
);
