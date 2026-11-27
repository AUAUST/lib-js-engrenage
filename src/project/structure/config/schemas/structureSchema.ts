import { boolean, string } from "valibot";

import { effectLevelsSchema, effectRanksSchema } from "#batiment/effects/index";
import { declare, declareObject, unset } from "#foundation/options/index";

export const structureSchema = declareObject(
  {
    effects: declareObject(
      {
        levels: declare(effectLevelsSchema, {
          description: "Effect levels, purest first, compared by index, each a default level's name or `{ name, purpose }`, the purpose project maps describe it by. They must contain `pure`, `printing`, `confined`, `observing` and `effectful` in that order and may add custom levels, each with its purpose, anywhere around them.",
          optional: unset(
            "`pure`, `printing`, `confined`, `observing`, `effectful`",
          ),
        }),
        // @debt the `modules` ranks, keyed by import specifier and ranking exports, describe JavaScript modules, unlike the level scale and the role ceilings, until the language port splits them out (#740, #684)
        modules: declare(effectRanksSchema, {
          description: "Levels of external modules, as a record of specifier glob to entry. A `node:` key also ranks its bare specifier. An entry is a level or `{ level, evaluation?, symbols?: { [memberPath]: level } }`, each member path an export name followed by the dotted members below it; `symbols.default` ranks the default export. An export or a member below it takes the level of the longest member path starting it that an entry lists in `symbols`, the first entry listing it winning, configured entries before the shipped table, else the level of the first entry matching its module, an exact specifier before any glob, else `fallback`. A member invoked through a namespace import takes its export's level. A module evaluates at the `evaluation` of the first entry stating one, configured entries before the shipped table, else at the purest level; a module nothing ranks evaluates at `fallback`.",
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
