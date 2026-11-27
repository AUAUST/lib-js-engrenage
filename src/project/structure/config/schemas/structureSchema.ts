import { boolean, string } from "valibot";

import { effectLevelsSchema, effectRanksSchema } from "#batiment/effects/index";
import { declare, declareObject, unset } from "#foundation/options/index";

export const structureSchema = declareObject(
  {
    effects: declareObject(
      {
        levels: declare(effectLevelsSchema, {
          description: "Effect levels, purest first, compared by index, each a default level's name or `{ name, purpose }`, the purpose project maps describe it by. They must contain `pure`, `confined`, `observing` and `effectful` in that order and may add custom levels, each with its purpose, anywhere around them.",
          optional: unset("`pure`, `confined`, `observing`, `effectful`"),
        }),
        modules: declare(effectRanksSchema, {
          description: "Levels of external modules, as a record of specifier glob to entry. An entry is a level or `{ level, symbols: { [exportName]: level } }`; `symbols.default` ranks the default export. An export takes the level of the first entry listing it in `symbols`, configured entries before the shipped table, else the level of the first entry matching its module, an exact specifier before any glob, else `fallback`. Namespace imports take the highest level their module's entries state.",
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
    ),
    internals: declare(boolean(), {
      description: "Whether every domain exposes its index under `<subpath>/internals`, with no stability guarantee.",
      optional: { value: false },
    }),
  },
  {
    description: "Structure settings shared by every environment.",
    optional: true,
  },
);
